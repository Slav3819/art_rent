import os
import asyncio
import asyncpg
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Конфигурация
TOKEN = os.getenv('TOKEN')
ADMIN_IDS = list(map(int, os.getenv('ADMIN_IDS', '').split(','))) if os.getenv('ADMIN_IDS') else []
CHAT_ID = os.getenv('CHAT_ID')

DB_CONFIG = {
    "database": os.getenv('DB_NAME'),
    "user": os.getenv('DB_USER'),
    "password": os.getenv('DB_PASSWORD'),
    "host": os.getenv('DB_HOST')
}

# Инициализация бота и диспетчера
bot = Bot(token=TOKEN)
dp = Dispatcher()


# Статусы заказов
class OrderStatus:
    NEW = "Новый"
    CONFIRMED = "Подтвержден"
    IN_PROGRESS = "В работе"
    DELIVERED = "Доставлен"
    CANCELLED = "Отменен"


class ContactStatus:
    UNPROCESSED = False
    PROCESSED = True


# Функция для логирования
def debug_log(message: str):
    print(f"[DEBUG] {message}")


async def get_db_connection():
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        debug_log(f"Ошибка подключения к БД: {e}")
        raise


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


# Функции для работы с заказами
async def get_order_details(order_id: int):
    conn = await get_db_connection()
    try:
        order_query = """
        SELECT id, customer_name, customer_phone, status, 
               created_at, customer_address, total 
        FROM backend_api_order 
        WHERE id = $1
        """
        order_record = await conn.fetchrow(order_query, order_id)

        if not order_record:
            return None

        items_query = """
        SELECT product_id, title, image, description,
               category, price, quantity
        FROM backend_api_orderitem
        WHERE order_id = $1
        ORDER BY id
        """
        items = await conn.fetch(items_query, order_id)

        order_data = dict(order_record)
        order_data['items'] = items
        return order_data
    except Exception as e:
        debug_log(f"Ошибка при получении данных заказа #{order_id}: {e}")
        return None
    finally:
        await conn.close()


async def get_orders(status_filter=None):
    conn = await get_db_connection()
    try:
        if status_filter:
            query = """
            SELECT id, customer_name, status 
            FROM backend_api_order 
            WHERE status = $1 
            ORDER BY created_at DESC
            """
            return await conn.fetch(query, status_filter)
        else:
            query = """
            SELECT id, customer_name, status 
            FROM backend_api_order 
            ORDER BY created_at DESC
            """
            return await conn.fetch(query)
    except Exception as e:
        debug_log(f"Ошибка при получении заказов: {e}")
        return []
    finally:
        await conn.close()


async def update_order_status(order_id: int, new_status: str):
    conn = await get_db_connection()
    try:
        query = """
        UPDATE backend_api_order 
        SET status = $1 
        WHERE id = $2 
        RETURNING id, customer_name, status
        """
        return await conn.fetchrow(query, new_status, order_id)
    except Exception as e:
        debug_log(f"Ошибка при обновлении статуса: {e}")
        return None
    finally:
        await conn.close()


# Функции для работы с контактными сообщениями
async def get_contact_messages(processed_filter=None):
    conn = await get_db_connection()
    try:
        if processed_filter is not None:
            query = """
            SELECT id, name, email, message, created_at, is_processed 
            FROM backend_api_contactmessage 
            WHERE is_processed = $1
            ORDER BY created_at DESC
            """
            return await conn.fetch(query, processed_filter)
        else:
            query = """
            SELECT id, name, email, message, created_at, is_processed 
            FROM backend_api_contactmessage 
            ORDER BY created_at DESC
            """
            return await conn.fetch(query)
    except Exception as e:
        debug_log(f"Ошибка при получении сообщений: {e}")
        return []
    finally:
        await conn.close()


async def mark_message_as_processed(message_id: int):
    conn = await get_db_connection()
    try:
        query = """
        UPDATE backend_api_contactmessage 
        SET is_processed = TRUE 
        WHERE id = $1 
        RETURNING id, name, email
        """
        return await conn.fetchrow(query, message_id)
    except Exception as e:
        debug_log(f"Ошибка при обновлении статуса сообщения: {e}")
        return None
    finally:
        await conn.close()


# Уведомления
async def send_status_notification(order_id: int, customer_name: str, old_status: str, new_status: str):
    try:
        message = (f"📢 Изменение статуса заказа!\n"
                   f"ID: {order_id}\n"
                   f"Клиент: {customer_name}\n"
                   f"Статус: {old_status} → {new_status}")
        await bot.send_message(chat_id=CHAT_ID, text=message)
    except Exception as e:
        debug_log(f"Ошибка при отправке уведомления: {e}")


async def send_new_contact_message_notification(message_id: int, name: str, email: str, message_text: str, created_at):
    try:
        created_at_str = created_at.strftime("%d.%m.%Y %H:%M")
        message = (
            f"📩 Новое сообщение от клиента!\n\n"
            f"🆔 ID: {message_id}\n"
            f"👤 Имя: {name}\n"
            f"📧 Email: {email}\n"
            f"📅 Дата: {created_at_str}\n"
            f"📝 Сообщение:\n{message_text}\n\n"
            f"Используйте /unprocessed для просмотра необработанных сообщений"
        )

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="✅ Отметить как обработанное",
                callback_data=f"mark_processed_{message_id}"
            )]
        ])

        await bot.send_message(
            chat_id=CHAT_ID,
            text=message,
            reply_markup=keyboard
        )
    except Exception as e:
        debug_log(f"Ошибка при отправке уведомления: {e}")


# Мониторинг изменений
async def watch_orders_changes():
    last_state = {}
    while True:
        try:
            conn = await get_db_connection()
            orders = await conn.fetch("SELECT id, customer_name, status FROM backend_api_order")
            current_state = {order['id']: order['status'] for order in orders}

            for order_id, current_status in current_state.items():
                last_status = last_state.get(order_id)

                if last_status is None:
                    order = next(o for o in orders if o['id'] == order_id)
                    await send_status_notification(
                        order_id=order_id,
                        customer_name=order['customer_name'],
                        old_status="не существовал",
                        new_status=current_status
                    )
                elif last_status != current_status:
                    order = next(o for o in orders if o['id'] == order_id)
                    await send_status_notification(
                        order_id=order_id,
                        customer_name=order['customer_name'],
                        old_status=last_status,
                        new_status=current_status
                    )

                last_state[order_id] = current_status

            await conn.close()
        except Exception as e:
            debug_log(f"Ошибка в мониторинге заказов: {e}")

        await asyncio.sleep(10)


async def watch_contact_messages():
    last_state = {}
    while True:
        try:
            conn = await get_db_connection()
            messages = await conn.fetch("""
                SELECT id, name, email, message, created_at, is_processed 
                FROM backend_api_contactmessage 
                WHERE is_processed = FALSE
                ORDER BY created_at DESC
            """)

            current_state = {msg['id']: msg['is_processed'] for msg in messages}

            for msg_id, is_processed in current_state.items():
                if msg_id not in last_state:
                    message = next(m for m in messages if m['id'] == msg_id)
                    await send_new_contact_message_notification(
                        message_id=msg_id,
                        name=message['name'],
                        email=message['email'],
                        message_text=message['message'],
                        created_at=message['created_at']
                    )

            last_state = current_state
            await conn.close()
        except Exception as e:
            debug_log(f"Ошибка в мониторинге сообщений: {e}")

        await asyncio.sleep(10)


# Команды бота
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    if is_admin(message.from_user.id):
        await message.answer(
            "Панель администратора\n\n"
            "Доступные команды:\n"
            "/orders - Управление заказами\n"
            "/contacts - Все сообщения\n"
            "/unprocessed - Необработанные сообщения\n"
            "/help - Помощь"
        )
    else:
        await message.answer("Доступ запрещен.")


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    if is_admin(message.from_user.id):
        await message.answer(
            "📋 Доступные команды:\n\n"
            "/orders - Список всех заказов\n"
            "/active - Заказы в работе\n"
            "/new - Новые заказы\n"
            "/confirmed - Подтвержденные заказы\n"
            "/delivered - Доставленные заказы\n"
            "/cancelled - Отмененные заказы\n\n"
            "/contacts - Все сообщения\n"
            "/unprocessed - Необработанные сообщения"
        )


# Команды для работы с заказами
@dp.message(Command("orders", "active", "new", "confirmed", "delivered", "cancelled"))
async def list_orders(message: types.Message):
    if not is_admin(message.from_user.id):
        await message.answer("Доступ запрещен.")
        return

    status_filter = {
        "/orders": None,
        "/active": OrderStatus.IN_PROGRESS,
        "/new": OrderStatus.NEW,
        "/confirmed": OrderStatus.CONFIRMED,
        "/delivered": OrderStatus.DELIVERED,
        "/cancelled": OrderStatus.CANCELLED
    }[message.text]

    orders = await get_orders(status_filter)
    if not orders:
        await message.answer("Нет заказов по вашему запросу.")
        return

    builder = InlineKeyboardBuilder()
    for order in orders:
        builder.add(InlineKeyboardButton(
            text=f"#{order['id']} - {order['customer_name']} ({order['status']})",
            callback_data=f"order_{order['id']}"
        ))
    builder.adjust(1)

    await message.answer(
        f"Список заказов ({len(orders)}):",
        reply_markup=builder.as_markup()
    )


@dp.callback_query(lambda c: c.data.startswith("order_"))
async def show_order_details(callback: types.CallbackQuery):
    try:
        if not is_admin(callback.from_user.id):
            await callback.answer("Доступ запрещен.")
            return

        order_id = int(callback.data.split("_")[1])
        order = await get_order_details(order_id)

        if not order:
            await callback.answer("Заказ не найден")
            return

        created_at = order['created_at'].strftime("%d.%m.%Y %H:%M")
        order_info = (
            f"📋 Заказ #{order['id']}\n\n"
            f"👤 Клиент: {order['customer_name']}\n"
            f"📞 Телефон: {order['customer_phone']}\n"
            f"🏠 Адрес: {order['customer_address']}\n"
            f"💵 Итого: {order['total']} руб.\n"
            f"📅 Дата: {created_at}\n"
            f"🔄 Статус: {order['status']}\n\n"
            f"🛍 Состав заказа:\n"
        )

        for index, item in enumerate(order['items'], start=1):
            order_info += (
                f"\n{index}. {item['title']}\n"
                f"   Категория: {item['category']}\n"
                f"   Цена: {item['price']} руб. × {item['quantity']} = {item['price'] * item['quantity']} руб.\n"
                f"   Артикул: {item['product_id']}\n"
            )

        buttons = []

        if order['status'] != OrderStatus.CONFIRMED:
            buttons.append(InlineKeyboardButton(
                text="✅ Подтвердить",
                callback_data=f"confirm_{order['id']}"
            ))

        if order['status'] != OrderStatus.IN_PROGRESS:
            buttons.append(InlineKeyboardButton(
                text="🛠 В работу",
                callback_data=f"progress_{order['id']}"
            ))

        if order['status'] != OrderStatus.DELIVERED:
            buttons.append(InlineKeyboardButton(
                text="🚚 Доставлен",
                callback_data=f"deliver_{order['id']}"
            ))

        if order['status'] != OrderStatus.CANCELLED:
            buttons.append(InlineKeyboardButton(
                text="❌ Отменить",
                callback_data=f"cancel_{order['id']}"
            ))

        # buttons.append(InlineKeyboardButton(
        #     text="🔙 Назад",
        #     callback_data="back_to_orders"
        # ))

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [buttons[0], buttons[1]] if len(buttons) > 1 else [buttons[0]],
            [buttons[2], buttons[3]] if len(buttons) > 3 else [buttons[2]] if len(buttons) > 2 else [],
            [buttons[-1]]
        ])

        try:
            await callback.message.edit_text(
                order_info,
                reply_markup=keyboard
            )
        except:
            await callback.message.delete()
            await callback.message.answer(
                order_info,
                reply_markup=keyboard
            )

        await callback.answer()

    except Exception as e:
        debug_log(f"Ошибка в show_order_details: {str(e)}")
        await callback.answer("Произошла ошибка", show_alert=True)


@dp.callback_query(lambda c: c.data.startswith(("confirm_", "progress_", "deliver_", "cancel_")))
async def process_status_change(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    action, order_id = callback.data.split("_")
    order_id = int(order_id)

    status_mapping = {
        "confirm": OrderStatus.CONFIRMED,
        "progress": OrderStatus.IN_PROGRESS,
        "deliver": OrderStatus.DELIVERED,
        "cancel": OrderStatus.CANCELLED
    }

    new_status = status_mapping[action]

    confirm_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Да", callback_data=f"status_confirm_{order_id}_{new_status}"),
            InlineKeyboardButton(text="❌ Нет", callback_data=f"order_{order_id}")
        ]
    ])

    await callback.message.edit_text(
        f"Вы уверены, что хотите изменить статус заказа #{order_id} на '{new_status}'?",
        reply_markup=confirm_keyboard
    )
    await callback.answer()


@dp.callback_query(lambda c: c.data.startswith("status_confirm_"))
async def confirm_status_change(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    _, _, order_id, new_status = callback.data.split("_")
    order_id = int(order_id)

    current_order = await get_order_details(order_id)
    if not current_order:
        await callback.answer("Заказ не найден")
        return

    updated_order = await update_order_status(order_id, new_status)
    if not updated_order:
        await callback.answer("Ошибка при обновлении статуса")
        return

    await send_status_notification(
        order_id=order_id,
        customer_name=updated_order['customer_name'],
        old_status=current_order['status'],
        new_status=new_status
    )

    await callback.answer(f"Статус изменен на {new_status}")
    await show_order_details(callback)


@dp.callback_query(lambda c: c.data == "back_to_orders")
async def back_to_orders(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    await list_orders(callback.message)
    await callback.answer()


# Команды для работы с контактными сообщениями
@dp.message(Command("contacts"))
async def cmd_contacts(message: types.Message):
    if not is_admin(message.from_user.id):
        await message.answer("Доступ запрещен.")
        return

    messages = await get_contact_messages()

    if not messages:
        await message.answer("Нет сообщений от клиентов.")
        return

    builder = InlineKeyboardBuilder()
    for msg in messages:
        status = "✅" if msg['is_processed'] else "❌"
        builder.add(InlineKeyboardButton(
            text=f"{status} #{msg['id']} - {msg['name']} ({msg['email']})",
            callback_data=f"contact_{msg['id']}"
        ))
    builder.adjust(1)

    await message.answer(
        "Все сообщения от клиентов:",
        reply_markup=builder.as_markup()
    )


@dp.message(Command("unprocessed"))
async def cmd_unprocessed(message: types.Message):
    if not is_admin(message.from_user.id):
        await message.answer("Доступ запрещен.")
        return

    messages = await get_contact_messages(processed_filter=ContactStatus.UNPROCESSED)

    if not messages:
        await message.answer("Нет необработанных сообщений.")
        return

    builder = InlineKeyboardBuilder()
    for msg in messages:
        builder.add(InlineKeyboardButton(
            text=f"❌ #{msg['id']} - {msg['name']} ({msg['email']})",
            callback_data=f"contact_{msg['id']}"
        ))
    builder.adjust(1)

    await message.answer(
        "Необработанные сообщения:",
        reply_markup=builder.as_markup()
    )


@dp.callback_query(lambda c: c.data.startswith("contact_"))
async def show_contact_message(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    message_id = int(callback.data.split("_")[1])
    conn = await get_db_connection()
    try:
        query = """
        SELECT id, name, email, message, created_at, is_processed 
        FROM backend_api_contactmessage 
        WHERE id = $1
        """
        message = await conn.fetchrow(query, message_id)

        if not message:
            await callback.answer("Сообщение не найдено")
            return

        created_at = message['created_at'].strftime("%d.%m.%Y %H:%M")
        status = "✅ Обработано" if message['is_processed'] else "❌ Не обработано"

        msg_text = (
            f"📩 Сообщение #{message['id']}\n\n"
            f"👤 Имя: {message['name']}\n"
            f"📧 Email: {message['email']}\n"
            f"📅 Дата: {created_at}\n"
            f"🔄 Статус: {status}\n\n"
            f"📝 Сообщение:\n{message['message']}"
        )

        keyboard = InlineKeyboardMarkup(inline_keyboard=[])

        if not message['is_processed']:
            keyboard.inline_keyboard.append([
                InlineKeyboardButton(
                    text="✅ Отметить как обработанное",
                    callback_data=f"mark_processed_{message['id']}"
                )
            ])

        # Определяем откуда пришли - из общего списка или необработанных
        is_from_unprocessed = "Необработанные" in callback.message.text
        back_callback = "back_to_unprocessed" if is_from_unprocessed else "back_to_contacts"

        # keyboard.inline_keyboard.append([
        #     InlineKeyboardButton(
        #         text="🔙 Назад",
        #         callback_data=back_callback
        #     )
        # ])

        await callback.message.edit_text(
            msg_text,
            reply_markup=keyboard
        )
        await callback.answer()
    finally:
        await conn.close()


@dp.callback_query(lambda c: c.data.startswith("mark_processed_"))
async def process_contact_message(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    message_id = int(callback.data.split("_")[2])
    result = await mark_message_as_processed(message_id)

    if result:
        # Обновляем сообщение с новым статусом
        conn = await get_db_connection()
        try:
            query = """
            SELECT id, name, email, message, created_at, is_processed 
            FROM backend_api_contactmessage 
            WHERE id = $1
            """
            message = await conn.fetchrow(query, message_id)

            created_at = message['created_at'].strftime("%d.%m.%Y %H:%M")
            msg_text = (
                f"📩 Сообщение #{message['id']}\n\n"
                f"👤 Имя: {message['name']}\n"
                f"📧 Email: {message['email']}\n"
                f"📅 Дата: {created_at}\n"
                f"🔄 Статус: ✅ Обработано\n\n"
                f"📝 Сообщение:\n{message['message']}"
            )

            # Определяем откуда пришли - из общего списка или необработанных
            is_from_unprocessed = "Необработанные" in callback.message.text
            back_callback = "back_to_unprocessed" if is_from_unprocessed else "back_to_contacts"

            # keyboard = InlineKeyboardMarkup(inline_keyboard=[
            #     [InlineKeyboardButton(
            #         text="🔙 Назад",
            #         callback_data=back_callback
            #     )]
            # ])


            await callback.answer("Сообщение отмечено как обработанное")
        except Exception as e:
            debug_log(f"Ошибка при обновлении сообщения: {e}")
            await callback.answer("Ошибка при обновлении", show_alert=True)
        finally:
            await conn.close()
    else:
        await callback.answer("Ошибка при обновлении статуса", show_alert=True)


@dp.callback_query(lambda c: c.data == "back_to_contacts")
async def back_to_contacts(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    await cmd_contacts(callback.message)
    await callback.answer()


@dp.callback_query(lambda c: c.data == "back_to_unprocessed")
async def back_to_unprocessed(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    await cmd_unprocessed(callback.message)
    await callback.answer()


# Запуск бота
async def main():
    asyncio.create_task(watch_orders_changes())
    asyncio.create_task(watch_contact_messages())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
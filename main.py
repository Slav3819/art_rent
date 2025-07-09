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


# Функция для логирования
def debug_log(message: str):
    print(f"[DEBUG] {message}")


async def get_db_connection():
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        debug_log("Успешное подключение к БД")
        return conn
    except Exception as e:
        debug_log(f"Ошибка подключения к БД: {e}")
        raise


def is_admin(user_id: int) -> bool:
    is_admin = user_id in ADMIN_IDS
    debug_log(f"Проверка прав администратора для {user_id}: {is_admin}")
    return is_admin


async def get_order_details(order_id: int):
    """Получает полную информацию о заказе и его товарах"""
    conn = await get_db_connection()
    try:
        # Получаем основную информацию о заказе
        order_query = """
        SELECT id, customer_name, customer_phone, status, 
               created_at, customer_address, total 
        FROM backend_api_order 
        WHERE id = $1
        """
        order_record = await conn.fetchrow(order_query, order_id)

        if not order_record:
            debug_log(f"Заказ #{order_id} не найден")
            return None

        # Получаем товары из этого заказа
        items_query = """
        SELECT product_id, title, image, description,
               category, price, quantity
        FROM backend_api_orderitem
        WHERE order_id = $1
        ORDER BY id
        """
        items = await conn.fetch(items_query, order_id)

        debug_log(f"Найдено {len(items)} товаров для заказа #{order_id}")

        # Преобразуем Record в словарь и добавляем товары
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


async def send_status_notification(order_id: int, customer_name: str, old_status: str, new_status: str):
    try:
        message = (f"📢 Изменение статуса заказа!\n"
                   f"ID: {order_id}\n"
                   f"Клиент: {customer_name}\n"
                   f"Статус: {old_status} → {new_status}")
        await bot.send_message(chat_id=CHAT_ID, text=message)
    except Exception as e:
        debug_log(f"Ошибка при отправке уведомления: {e}")


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

            for order_id in set(last_state.keys()) - set(current_state.keys()):
                await send_status_notification(
                    order_id=order_id,
                    customer_name="неизвестно",
                    old_status=last_state[order_id],
                    new_status="удален"
                )
                del last_state[order_id]

            await conn.close()
        except Exception as e:
            debug_log(f"Ошибка в мониторинге заказов: {e}")

        await asyncio.sleep(10)


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    if is_admin(message.from_user.id):
        await message.answer(
            "Панель администратора заказов\n\n"
            "Доступные команды:\n"
            "/orders - Все заказы\n"
            "/active - Заказы в работе\n"
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
            "/cancelled - Отмененные заказы"
        )


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
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    order_id = int(callback.data.split("_")[1])
    order = await get_order_details(order_id)

    if not order:
        await callback.answer("Заказ не найден")
        return

    # Отладочная информация
    debug_log(f"Текущий статус заказа: {order['status']}")
    debug_log(f"Доступные статусы: {OrderStatus.__dict__}")

    # Форматируем дату
    created_at = order['created_at'].strftime("%d.%m.%Y %H:%M")

    # Формируем сообщение
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

    # Создаем кнопки
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

    buttons.append(InlineKeyboardButton(
        text="🔙 Назад",
        callback_data="back_to_orders"
    ))

    # Формируем клавиатуру
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        buttons[i:i + 2] for i in range(0, len(buttons), 2)
    ])

    try:
        await callback.message.edit_text(
            order_info,
            reply_markup=keyboard
        )
    except Exception as e:
        debug_log(f"Ошибка отправки сообщения: {e}")
        await callback.answer("Ошибка отображения кнопок")

    await callback.answer()


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

    # Клавиатура подтверждения
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

    # Получаем текущий статус
    current_order = await get_order_details(order_id)
    if not current_order:
        await callback.answer("Заказ не найден")
        return

    # Обновляем статус
    updated_order = await update_order_status(order_id, new_status)
    if not updated_order:
        await callback.answer("Ошибка при обновлении статуса")
        return

    # Уведомление
    await send_status_notification(
        order_id=order_id,
        customer_name=updated_order['customer_name'],
        old_status=current_order['status'],
        new_status=new_status
    )

    await callback.answer(f"Статус изменен на {new_status}")

    # Возврат к деталям заказа
    await show_order_details(callback)


@dp.callback_query(lambda c: c.data == "back_to_orders")
async def back_to_orders(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ запрещен.")
        return

    await list_orders(callback.message)
    await callback.answer()


async def main():
    debug_log("Запуск бота...")
    asyncio.create_task(watch_orders_changes())
    await dp.start_polling(bot)


if __name__ == "__main__":
    debug_log("Инициализация приложения")
    asyncio.run(main())
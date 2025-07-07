from django.db import models
from users.models import User
from django.core.validators import EmailValidator

class ContactMessage(models.Model):
    name = models.CharField(max_length=100, verbose_name='Имя')
    email = models.EmailField(
        max_length=255,
        validators=[EmailValidator()],
        verbose_name='Email'
    )
    message = models.TextField(verbose_name='Сообщение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_processed = models.BooleanField(default=False, verbose_name='Обработано')

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['-created_at']

    def __str__(self):
        return f'Сообщение от {self.name} ({self.email})'

class UserRent(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)


class DeviceRent(models.Model):
    title = models.CharField(max_length=100)
    img = models.CharField(max_length=100)
    desc = models.TextField(max_length=100)
    category = models.CharField(max_length=100)
    price = models.FloatField()

class Basket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    device = models.ForeignKey(DeviceRent, on_delete=models.CASCADE)


from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('in_progress', 'В работе'),
        ('shipped', 'Отправлен'),
        ('completed', 'Выполнен'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('card', 'Карта'),
        ('cash', 'Наличные'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='Пользователь'
    )
    customer_name = models.CharField(max_length=100, verbose_name='Имя клиента')
    customer_phone = models.CharField(max_length=20, verbose_name='Телефон клиента')
    customer_address = models.CharField(max_length=200, verbose_name='Адрес клиента')
    customer_email = models.EmailField(verbose_name='Email клиента')
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES,
        default='card',
        verbose_name='Способ оплаты'
    )
    comments = models.TextField(blank=True, verbose_name='Комментарии')
    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='in_progress',
        verbose_name='Статус заказа'
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Общая сумма'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заказ #{self.id} от {self.customer_name}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE,
        verbose_name='Заказ'
    )
    product_id = models.PositiveIntegerField(verbose_name='ID товара')
    title = models.CharField(max_length=100, verbose_name='Название товара')
    image = models.CharField(max_length=100, blank=True, verbose_name='Изображение')
    description = models.TextField(blank=True, verbose_name='Описание')
    category = models.CharField(max_length=50, verbose_name='Категория')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Цена'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Количество'
    )

    class Meta:
        verbose_name = 'Элемент заказа'
        verbose_name_plural = 'Элементы заказа'

    def __str__(self):
        return f'{self.title} (x{self.quantity})'

    @property
    def total_price(self):
        return self.price * self.quantity

class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='Пользователь'
    )
    device = models.ForeignKey(
        DeviceRent,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name='Устройство'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата добавления'
    )

    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные товары'
        unique_together = ('user', 'device')  # Запрещает дублирование
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.device.title}"


from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    # Убираем стандартное поле username
    username = None

    # Основные поля
    name = models.CharField(max_length=255, verbose_name='Полное имя')
    email = models.EmailField(max_length=255, unique=True, verbose_name='Email')
    password = models.CharField(max_length=255, verbose_name='Пароль')

    # Добавляем новые поля
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Телефон',
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Номер телефона должен быть в формате: '+999999999'. Допускается до 15 цифр."
            )
        ]
    )
    first_name = models.CharField(max_length=150, blank=True, verbose_name='Имя')
    last_name = models.CharField(max_length=150, blank=True, verbose_name='Фамилия')

    # Настройки модели
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email


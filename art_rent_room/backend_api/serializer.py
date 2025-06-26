from rest_framework import serializers
from .models import *


class OrderItemSerializer(serializers.ModelSerializer):
    img = serializers.CharField(source='image', required=False)
    desc = serializers.CharField(source='description', required=False)
    id = serializers.IntegerField(source='product_id')  # Добавляем явное поле для product_id

    class Meta:
        model = OrderItem
        fields = ['id', 'title', 'img', 'desc', 'category', 'price', 'quantity']
        extra_kwargs = {
            'quantity': {'default': 1},
            'id': {'required': True}  # Делаем поле обязательным
        }


class CustomerInfoSerializer(serializers.Serializer):
    name = serializers.CharField(source='customer_name')
    phone = serializers.CharField(source='customer_phone')
    address = serializers.CharField(source='customer_address')
    email = serializers.EmailField(source='customer_email')
    paymentMethod = serializers.CharField(source='payment_method')
    comments = serializers.CharField(required=False, allow_blank=True)


class OrderCreateSerializer(serializers.ModelSerializer):
    customerInfo = CustomerInfoSerializer(source='*', write_only=True)
    orderItems = OrderItemSerializer(source='items', many=True, write_only=True)

    class Meta:
        model = Order
        fields = ['customerInfo', 'orderItems', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            # Явно извлекаем product_id из входных данных
            product_id = item_data.pop('product_id')
            OrderItem.objects.create(
                order=order,
                product_id=product_id,
                **item_data
            )

        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status']


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

class UserRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRent
        fields = ['name', 'title']


class DeviceRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceRent
        fields = '__all__'


class BasketSerializer(serializers.ModelSerializer):
    device = DeviceRentSerializer()  # Вложенный сериализатор
    class Meta:
        model = Basket
        fields = '__all__'




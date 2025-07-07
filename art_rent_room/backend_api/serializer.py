from rest_framework import serializers
from .models import *

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at', 'is_processed']
        read_only_fields = ['id', 'created_at', 'is_processed']


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
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = DeviceRent
        fields = ['id', 'title', 'img', 'desc', 'category', 'price', 'is_favorite']

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(
                user=request.user,
                device=obj
            ).exists()
        return False

class BasketSerializer(serializers.ModelSerializer):
    device = DeviceRentSerializer()  # Вложенный сериализатор
    class Meta:
        model = Basket
        fields = '__all__'


class FavoriteSerializer(serializers.ModelSerializer):
    device_details = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'device', 'device_details', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_device_details(self, obj):
        device = obj.device
        return {
            'id': device.id,
            'title': device.title,
            'price': device.price,
            'image': device.img,
            'category': device.category
        }

    def validate(self, data):
        user = self.context['request'].user
        device = data.get('device')

        if Favorite.objects.filter(user=user, device=device).exists():
            raise serializers.ValidationError("Этот товар уже в избранном")

        return data

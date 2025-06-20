from django.shortcuts import render
from rest_framework.views import APIView
from .models import UserRent, DeviceRent, Basket
from .serializer import UserRentSerializer, DeviceRentSerializer, BasketSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6  # Количество элементов на странице
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,  # Добавляем общее количество страниц
            'current_page': self.page.number,  # Добавляем текущую страницу
            'results': data,
            'page_size': self.get_page_size(self.request)  # Добавляем текущий размер страницы
        })


# Create your views here.
class UserRentView(APIView):
    def get(self, request):
        output = [
            {
                "name": output.name,
                "title": output.title
            } for output in UserRent.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = UserRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

class DeviceRentView(APIView):
    def get(self, request):
        paginator = StandardResultsSetPagination()
        queryset = DeviceRent.objects.all()
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = DeviceRentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = DeviceRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)


class BasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Получить содержимое корзины пользователя
        """
        baskets = Basket.objects.filter(user=request.user)
        serializer = BasketSerializer(baskets, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Добавить устройство в корзину
        """
        device_id = request.data.get('device')
        device = get_object_or_404(DeviceRent, id=device_id)

        # Проверяем, есть ли уже устройство в корзине
        basket_item, created = Basket.objects.get_or_create(
            user=request.user,
            device=device,
            defaults={'quantity': request.data.get('quantity', 1)}
        )

        if not created:
            basket_item.quantity += int(request.data.get('quantity', 1))
            basket_item.save()

        serializer = BasketSerializer(basket_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BasketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """
        Удалить устройство из корзины
        """
        basket_item = get_object_or_404(Basket, pk=pk, user=request.user)
        basket_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        """
        Обновить количество устройства в корзине
        """
        basket_item = get_object_or_404(Basket, pk=pk, user=request.user)
        quantity = request.data.get('quantity')

        if quantity and quantity.isdigit():
            basket_item.quantity = int(quantity)
            basket_item.save()
            serializer = BasketSerializer(basket_item)
            return Response(serializer.data)

        return Response(
            {"error": "Invalid quantity"},
            status=status.HTTP_400_BAD_REQUEST
        )


class ClearBasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """
        Очистить всю корзину пользователя
        """
        Basket.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



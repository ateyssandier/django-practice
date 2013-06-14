from django.contrib import admin
from budgetapp.models import Category, Purchases, Paychecks

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('superCategory', 'subCategory')

admin.site.register(Category, CategoryAdmin)
admin.site.register(Paychecks)
admin.site.register(Purchases)

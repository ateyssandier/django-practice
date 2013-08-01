from django.contrib import admin
from django.db import models
from django.forms import CheckboxSelectMultiple
from budgetapp.models import Category, Purchases, Paychecks, Budget

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('superCategory', 'subCategory')

class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'max')
    formfield_overrides = {
        models.ManyToManyField: {'widget': CheckboxSelectMultiple},
    }


admin.site.register(Category, CategoryAdmin)
admin.site.register(Paychecks)
admin.site.register(Purchases)
admin.site.register(Budget, BudgetAdmin)

from django.contrib import admin
from django.db import models
from django.forms import CheckboxSelectMultiple
from budgetapp.models import SuperCategory,  SubCategory, Purchases, Paychecks

class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('superCategory', 'subCategory', 'mint_id')

class SuperCategoryAdmin(admin.ModelAdmin):
    pass

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('date', 'mint_id', 'item_desc', 'cost', 'category')
    search_fields = ('item_desc',)

class PaycheckAdmin(admin.ModelAdmin):
    list_display = ('date', 'mint_id', 'net')
    search_fields = ('date',)

class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'max')
    formfield_overrides = {
        models.ManyToManyField: {'widget': CheckboxSelectMultiple},
    }


admin.site.register(SubCategory, SubCategoryAdmin)
admin.site.register(SuperCategory, SuperCategoryAdmin)
admin.site.register(Paychecks, PaycheckAdmin)
admin.site.register(Purchases, PurchaseAdmin)

from django.conf.urls import patterns, include, url
import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'budget.views.home', name='home'),
    # url(r'^budget/', include('budget.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'budgetapp.views.index', name='index'),
    (r'^index/$', 'budgetapp.views.index'),
    url(r'^uploadcsv/$', 'csvprocessor.views.uploadcsv', name='uploadcsv'),
    url(r'^fetch_transactions/$', 'csvprocessor.views.fetch_transactions', name='fetch_transactions'),
    url(r'^addcategory/$', 'budgetapp.views.addcategory', name='addcategory'),
    url(r'^addpaycheck/$', 'budgetapp.views.addpaycheck', name='addpaycheck'),
    url(r'^addpurchase/$', 'budgetapp.views.addpurchase', name='addpurchase'),
    url(r'^getreport/$', 'budgetapp.views.getreport', name='getreport'),
    url(r'^getpurchasestable/$', 'budgetapp.views.getpurchasetable', name='getpurchasestable'),
    url(r'^getpaycheckstable/$', 'budgetapp.views.getpaycheckstable', name='getpaycheckstable'),
    url(r'^getsubchart/$', 'budgetapp.views.getsubchart', name='getsubchart'),
)

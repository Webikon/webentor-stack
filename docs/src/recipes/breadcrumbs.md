# Recipe: Breadcrumbs path

Customize breadcrumbs path data.

```php
add_filter('webentor/breadcrumbs/path', function ($path) {
  array_splice($path, 1, 0, [[__('Shop', 'webentor'), '/shop']]);
  return $path;
}, 10, 1);
```


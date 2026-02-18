# Recipe: Allowed blocks

Control which blocks appear in the inserter.

```php
add_filter('allowed_block_types_all', function ($allowed, $context) {
    $allow = [
      'core/heading', 'core/paragraph', 'core/table', 'gravityforms/form',
    ];
    return is_array($allowed) ? array_merge($allowed, $allow) : $allow;
}, 99, 2);
```


# Recipe: Query loop customizations

Adjust `WP_Query` args for `e-query-loop` and `e-picker-query-loop`.

```php
add_filter('webentor/query_loop_args', function ($args, $queryId) {
  if ($queryId === 'homepage-featured') {
    $args['posts_per_page'] = 3;
    $args['ignore_sticky_posts'] = true;
  }
  return $args;
}, 10, 2);
```

Tip: Use with ACF Options to toggle featured content per locale.


<?php

namespace App\View\Directives;

class XDebugBladeDirective
{
    public function __invoke($expression)
    {
        return "<?php if (function_exists('xdebug_break')) { xdebug_break(); } ?>";
    }
}

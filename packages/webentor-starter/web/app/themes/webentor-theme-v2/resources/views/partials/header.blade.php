<header
  class="header {{ $block_classes }} relative z-50 flex min-h-[74px] items-center bg-white py-5 lg:py-4 2xl:px-6"
  x-data="{ openMenu: false }"
>
  <div class="container flex w-full items-center gap-x-6">
    <div class="flex flex-1 lg:flex-none">
      <a href="{{ $home_url }}">
        <span class="sr-only">{{ bloginfo('name') }}</span>

        @svg('images.svg.site-logo', 'sm:min-w-[200px] h-[40px] w-full')
      </a>
    </div>

    <nav
      class="ml-auto hidden gap-x-2 lg:flex"
      x-data="menu()"
      x-init="init()"
    >
      @notempty($primary_nav)
        @foreach ($primary_nav as $item)
          @if (!empty($item['children']))
            @php
              $item_slug = Str::slug($item['title']);
            @endphp

            <div
              @mouseenter.outside="open == '{{ $item_slug }}' ? open = false : ''"
              @click.outside="open == '{{ $item_slug }}' ? open = false : ''"
              class="relative"
            >
              <button
                type="button"
                class="text-main-menu-item hover:text-red hover:bg-red-light group relative flex items-center gap-x-1 rounded-lg p-2"
                @touchstart="toggle('{{ $item_slug }}', $event)"
                @mouseenter="openPopover('{{ $item_slug }}', $event)"
                @keydown.enter="toggle('{{ $item_slug }}', $event)"
                aria-expanded="false"
                :aria-expanded="(open == '{{ $item_slug }}').toString()"
                :class="{
                    'bg-red-light text-red': open == '{{ $item_slug }}',
                }"
              >
                {!! $item['title'] ?? '' !!}

                <span
                  class="transition-transform"
                  :class="{ 'rotate-180': open == '{{ $item_slug }}' }"
                >
                  @svg('images.svg.chevron-down', 'w-4 h-4 text-current')
                </span>
              </button>

              <div
                x-show="open == '{{ $item_slug }}'"
                x-cloak
                x-transition:enter="transition ease-out duration-200"
                x-transition:enter-start="opacity-0 -translate-y-1"
                x-transition:enter-end="opacity-100 translate-y-0"
                x-transition:leave="transition ease-in duration-150"
                x-transition:leave-start="opacity-100 translate-y-0"
                x-transition:leave-end="opacity-0 -translate-y-1"
                x-transition.origin.top.left
                x-description="'Flyout menu, show/hide based on flyout menu state."
                class="absolute left-0 z-10 mt-1.5 min-w-48 origin-top-left rounded-2xl bg-white p-2 outline-none"
                x-ref="panel"
                @mouseleave="open == '{{ $item_slug }}' ? open = false : ''"
                @keydown.window.escape="open = false"
                style="display: none;"
              >
                <div class="my-2 flex flex-col gap-4">
                  @foreach ($item['children'] as $child)
                    <a
                      href="{{ $child['url'] }}"
                      class="text-main-menu-item hover:text-red group relative px-2"
                    >
                      {!! $child['title'] ?? '' !!}
                    </a>
                  @endforeach
                </div>
              </div>

            </div>
          @else
            <a
              href="{{ $item['url'] }}"
              class="text-main-menu-item hover:text-red hover:bg-red-light group relative flex items-center gap-x-1 rounded-lg p-2"
              @mouseenter="open = false"
            >
              {!! $item['title'] ?? '' !!}
            </a>
          @endif
        @endforeach
      @endnotempty
    </nav>

    {{-- Button & Mobile hamburger --}}
    <div class="flex gap-x-3">
      @notempty($login_btn['url'])
        <div class="hidden items-center md:flex">
          <x-button
            title="{{ $login_btn['title'] ?? '' }}"
            element="a"
            variant="primary"
            url="{{ $login_btn['url'] }}"
            target="{{ $login_btn['target'] ?? '_self' }}"
            size="small"
          />
        </div>
      @endnotempty

      {{-- Mobile hamburger --}}
      <button
        type="button"
        class="inline-flex items-center justify-center gap-3 self-center p-2 lg:hidden"
        @click="openMenu = true"
      >
        <span class="uppercase leading-none">{{ __('Menu', 'webentor') }}</span>

        @svg('images.svg.hamburger', 'w-6 h-6')
      </button>
    </div>
  </div>

  {{-- Mobile menu --}}
  <div
    x-description="Mobile menu, show/hide based on menu open state."
    class="transition-opacity lg:hidden"
    x-ref="mobile-menu"
    x-show="openMenu"
    x-cloak
    aria-modal="true"
    style="display: none;"
    x-transition:enter="ease-in-out duration-250"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="ease-in-out duration-250"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
  >
    <div
      x-description="Background backdrop, show/hide based on slide-over state."
      class="fixed inset-0 z-50 bg-black opacity-30"
    ></div>

    <div
      class="{{ is_user_logged_in() ? 'mt-12 md:mt-8' : '' }} fixed inset-y-0 right-0 z-50 w-full max-w-[360px] overflow-y-auto bg-white py-5 md:max-w-md"
      @click.away="openMenu = false"
      x-show="openMenu"
      x-cloak
      x-transition:enter="transform transition ease-in-out duration-250"
      x-transition:enter-start="translate-x-full"
      x-transition:enter-end="translate-x-0"
      x-transition:leave="transform transition ease-in-out duration-250"
      x-transition:leave-start="translate-x-0"
      x-transition:leave-end="translate-x-full"
    >
      <div class="flex items-center justify-between gap-8 px-5">
        <button
          type="button"
          class="ml-auto inline-flex items-center justify-center self-center p-1 lg:hidden"
          @click="openMenu = false"
        >
          <span class="sr-only">{{ __('Close main menu', 'webentor') }}</span>

          @svg('images.svg.close', 'w-6 h-6')
        </button>
      </div>

      <div class="mt-5">
        @notempty($primary_nav)
          @foreach ($primary_nav as $item)
            @if (!empty($item['children']))
              @php
                $item_slug = Str::slug($item['title']);
              @endphp

              <div
                x-data="{ open: false }"
                class="border-grey-100 border-b"
              >
                <button
                  type="button"
                  class="text-main-menu-item leading-100 hover:text-red flex w-full items-center gap-x-2 px-5 py-3"
                  aria-controls="submenu-{{ $item_slug }}"
                  @click="open = !open"
                  aria-expanded="false"
                  x-bind:aria-expanded="open.toString()"
                >
                  {!! $item['title'] ?? '' !!}

                  <span
                    class="transition-transform"
                    :class="{ 'rotate-180': open }"
                  >
                    @svg('images.svg.chevron-down', ['class' => 'h-5 w-5 text-current'])
                  </span>
                </button>

                <div
                  class="bg-white px-5 py-2 pb-3"
                  x-description="Menu item sub-menu, show/hide based on menu state."
                  x-show="open"
                  x-cloak
                  style="display: none;"
                >
                  <div class="flex flex-col gap-3">
                    @foreach ($item['children'] as $child)
                      <a
                        href="{{ $child['url'] }}"
                        class="text-main-menu-item hover:text-red group relative"
                      >{!! $child['title'] !!}</a>
                    @endforeach
                  </div>
                </div>
              </div>
            @else
              <a
                href="{{ $item['url'] }}"
                target="{{ $item['target'] ?? '_self' }}"
                class="text-main-menu-item leading-100 hover:text-red border-grey-100 block border-b px-5 py-3"
              >
                {{ $item['title'] ?? '' }}
              </a>
            @endif
          @endforeach
        @endnotempty

        @notempty($login_btn['url'])
          <div class="flex px-5 py-3">
            <x-button
              title="{{ $login_btn['title'] ?? '' }}"
              element="a"
              variant="primary"
              url="{{ $login_btn['url'] }}"
              target="{{ $login_btn['target'] ?? '_self' }}"
              size="small"
            />
          </div>
        @endnotempty
      </div>
    </div>
  </div>
</header>

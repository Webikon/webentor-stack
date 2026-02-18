<div class="container">
  <h2 class="text-h2 my-8">Buttons</h2>

  <div class="mb-2">
    <div class="mb-5 flex flex-wrap items-center gap-3">
      <x-button
        title="Button Primary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="small"
      />
      <x-button
        title="Button Primary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="medium"
        iconPosition="right"
        icon="chevron-right"
        {{-- Example of dataAttributes --}}
        {{-- :dataAttributes="[
            'data-params' => json_encode($addToCartInitParams ?? ''),
            '@click' =>
                '(e) => {$store.cart.addItem(\'' .
                ($product ?? '') .
                '\', e.currentTarget.dataset.params, \'' .
                ($period ?? 1) .
                '\')}',
        ]" --}}
      />
      <x-button
        title="Button Primary Selected"
        id="test"
        classes="test btn--selected"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="left"
        icon="chevron-right"
      />
      <x-button
        title="Button Primary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="alone"
        icon="chevron-right"
      />
      <x-button
        title="Button Primary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        disabled="true"
      />
    </div>

    <div class="mb-5 flex flex-wrap items-center gap-3">
      <x-button
        title="Button secondary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="secondary"
        url="https://google.com"
        openInNewTab="true"
        size="small"
      />
      <x-button
        title="Button secondary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="secondary"
        url="https://google.com"
        openInNewTab="true"
        size="medium"
        iconPosition="right"
        icon="chevron-right"
      />
      <x-button
        title="Button secondary Selected"
        id="test"
        classes="test btn--selected"
        disabled="false"
        element="a"
        variant="secondary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="left"
        icon="chevron-right"
      />
      <x-button
        title="Button secondary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="secondary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="alone"
        icon="chevron-right"
      />
      <x-button
        title="Button secondary"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="secondary"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        disabled="true"
      />
    </div>

    <div class="mb-5 flex flex-wrap items-center gap-3">
      <x-button
        title="Button subtle"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="subtle"
        url="https://google.com"
        openInNewTab="true"
        size="small"
      />
      <x-button
        title="Button subtle"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="subtle"
        url="https://google.com"
        openInNewTab="true"
        size="medium"
        iconPosition="right"
        icon="chevron-right"
      />
      <x-button
        title="Button subtle Selected"
        id="test"
        classes="test btn--selected"
        disabled="false"
        element="a"
        variant="subtle"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="left"
        icon="chevron-right"
      />
      <x-button
        title=""
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="subtle"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        iconPosition="alone"
        icon="chevron-right"
      />
      <x-button
        title="Button subtle"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="subtle"
        url="https://google.com"
        openInNewTab="true"
        size="large"
        disabled="true"
      />
    </div>

    <div class="text-h3 mb-5">Icon Buttons</div>

    <div class="mb-5 flex flex-wrap items-center gap-3">
      {{-- IMPORTANT: You can either use icon prop or use icon slot --}}
      <x-button
        title="Icon Button Left"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="small"
        iconPosition="alone"
      >
        <x-slot:icon>
          @svg('images.svg.chevron-left', 'btn__icon')
        </x-slot:icon>
      </x-button>

      <x-button
        title="Icon Button Right"
        id="test"
        classes="test"
        disabled="false"
        element="a"
        variant="primary"
        url="https://google.com"
        openInNewTab="true"
        size="medium"
        iconPosition="alone"
        icon="chevron-right"
      />
    </div>
  </div>
</div>

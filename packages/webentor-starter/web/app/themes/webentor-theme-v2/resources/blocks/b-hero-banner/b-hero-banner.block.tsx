import {
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from '@wordpress/block-editor';
import { BlockEditProps, registerBlockType } from '@wordpress/blocks';
import { Button, PanelBody, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import block from './block.json';

/**
 * Edit component.
 * See https://wordpress.org/gutenberg/handbook/designers-developers/developers/block-api/block-edit-save/#edit
 *
 * @param {object}   props                      					The block props.
 * @returns {Function}                                    Render the edit screen
 */

type AttributesType = {
  coverImage: string;
  img: { id: number; url: string; alt: string };
  mobileImg: { id: number; url: string; alt: string };
};

const BlockEdit: React.FC<BlockEditProps<AttributesType>> = (props) => {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps();

  const onSelectImage = (media) => {
    setAttributes({ img: { id: media.id, url: media.url, alt: media.alt } });
  };

  const removeImage = () => {
    setAttributes({ img: null });
  };

  const onSelectMobileImage = (media) => {
    setAttributes({
      mobileImg: { id: media.id, url: media.url, alt: media.alt },
    });
  };

  const removeMobileImage = () => {
    setAttributes({ mobileImg: null });
  };

  const template = [
    [
      'core/heading',
      {
        content: __('This is a hero slide heading', 'webentor'),
        textColor: 'grey-900',
        customTypography: 'text-h2-semibold',
      },
    ],
    [
      'core/paragraph',
      {
        content: __('Here goes some text content.', 'webentor'),
        textColor: 'grey-900',
        customTypography: 'text-headline',
      },
    ],
    [
      'webentor/l-flexible-container',
      {
        display: { display: { value: { basic: 'flex', md: 'flex' } } },

        template: [
          [
            'webentor/e-button',
            {
              button: {
                showButton: true,
                title: __('Learn more', 'webentor'),
                variant: 'grey-primary',
                url: '#',
                size: 'medium',
              },
            },
          ],
          [
            'webentor/e-button',
            {
              button: {
                showButton: true,
                title: __('Learn more', 'webentor'),
                variant: 'secondary',
                url: '#',
                size: 'medium',
              },
            },
          ],
        ],
        flexbox: {
          gap: { value: { basic: 'gap-3' } },
          'flex-direction': { value: { basic: 'flex-col', md: 'flex-row' } },
        },
      },
    ],
  ] as const;

  // Preview image for block inserter
  if (attributes.coverImage) {
    return <img src={attributes.coverImage} width="468" alt="Cover Preview" />;
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Block Settings" initialOpen={true}>
          <PanelRow>
            <div className="flex flex-col">
              <p className="mb-2">{__('Desktop Image', 'webentor')}</p>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={onSelectImage}
                  allowedTypes={['image']}
                  value={attributes?.img?.id}
                  render={({ open }) => (
                    <Button
                      onClick={open}
                      className={
                        attributes?.img?.id ? '!h-fit !w-fit !p-0' : ''
                      }
                      variant={attributes?.img?.id ? undefined : 'secondary'}
                    >
                      {attributes?.img?.id ? (
                        <img
                          src={attributes.img.url}
                          alt={attributes.img?.alt}
                          width="100%"
                        />
                      ) : (
                        __('Select Desktop Image', 'webentor')
                      )}
                    </Button>
                  )}
                />
              </MediaUploadCheck>

              {attributes?.img?.id && (
                <Button
                  onClick={removeImage}
                  className="h-fit w-fit"
                  variant="link"
                  isDestructive
                >
                  {__('Remove Desktop Image', 'webentor')}
                </Button>
              )}
            </div>
          </PanelRow>

          <PanelRow>
            <div className="flex flex-col">
              <p className="mb-2">{__('Mobile Image', 'webentor')}</p>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={onSelectMobileImage}
                  allowedTypes={['image']}
                  value={attributes?.mobileImg?.id}
                  render={({ open }) => (
                    <Button
                      onClick={open}
                      className={
                        attributes?.mobileImg?.id ? '!h-fit !w-fit !p-0' : ''
                      }
                      variant={
                        attributes?.mobileImg?.id ? undefined : 'secondary'
                      }
                    >
                      {attributes?.mobileImg?.id ? (
                        <img
                          src={attributes.mobileImg.url}
                          alt={attributes.mobileImg?.alt}
                          width="100%"
                        />
                      ) : (
                        __('Select Mobile Image', 'webentor')
                      )}
                    </Button>
                  )}
                />
              </MediaUploadCheck>

              {attributes?.mobileImg?.id && (
                <Button
                  onClick={removeMobileImage}
                  className="h-fit w-fit"
                  variant="link"
                  isDestructive
                >
                  {__('Remove Mobile Image', 'webentor')}
                </Button>
              )}
            </div>
          </PanelRow>
        </PanelBody>
      </InspectorControls>

      <div
        {...blockProps}
        className={`${blockProps.className} w-flexible-container flex w-full flex-row gap-8 p-2`}
      >
        <div className="relative z-10 flex flex-col gap-5 px-8 py-10">
          <InnerBlocks template={template} />
        </div>

        <div className="absolute inset-0 bg-grey-900 opacity-20"></div>

        {attributes?.img?.id && (
          <>
            <img
              src={attributes.img.url}
              alt="banner-img"
              className="absolute top-0 left-0 hidden !h-full !w-full object-cover md:block"
            />
            <img
              src={attributes.mobileImg?.url || attributes.img.url}
              alt="banner-img"
              className="absolute top-0 left-0 block !h-full !w-full object-cover md:hidden"
            />
          </>
        )}
      </div>
    </>
  );
};

/**
 * See https://wordpress.org/gutenberg/handbook/designers-developers/developers/block-api/block-edit-save/#save
 *
 * @return {null} Dynamic blocks do not save the HTML.
 */
const BlockSave = () => <InnerBlocks.Content />;

/**
 * Register block.
 */
registerBlockType(block, { edit: BlockEdit, save: BlockSave });

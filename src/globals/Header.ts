import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { revalidateHeader } from '@/hooks/revalidateHeader'
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateHeader],
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: 'Header Style',
      defaultValue: 'style1',
      admin: {
        description:
          'Choose the visual layout for your header. Changes take effect immediately on the storefront.',
        position: 'sidebar',
      },
      options: [
        { label: 'Style 1 — Centered Logo + Split Nav', value: 'style1' },
        { label: 'Style 2 — Left Logo + Right Nav (Minimal)', value: 'style2' },
        { label: 'Style 3 — Full-Width Banner Bar', value: 'style3' },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
      admin: {
        description:
          'Upload your store logo. Recommended: SVG or PNG with transparent background, min 200px wide.',
      },
    },
    {
      name: 'logoText',
      type: 'text',
      label: 'Logo Text (Fallback)',
      admin: {
        description: 'Shown when no logo image is uploaded. E.g. your store name.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Links',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
    },
    {
      name: 'features',
      type: 'group',
      label: 'Header Features',
      admin: {
        description: 'Toggle which UI elements appear in the header.',
      },
      fields: [
        {
          name: 'showCart',
          type: 'checkbox',
          label: 'Show Cart Icon',
          defaultValue: true,
        },
        {
          name: 'showLogin',
          type: 'checkbox',
          label: 'Show Login / Account Button',
          defaultValue: true,
        },
        {
          name: 'showSearch',
          type: 'checkbox',
          label: 'Show Search Icon',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'announcement',
      type: 'group',
      label: 'Announcement Bar',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Announcement Bar',
          defaultValue: false,
        },
        {
          name: 'text',
          type: 'text',
          label: 'Announcement Text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Announcement Link (optional)',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
  ],
}
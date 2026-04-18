'use client'

import type { Header } from 'src/payload-types'
import { HeaderStyle1 } from './styles/HeaderStyle1'
import { HeaderStyle2 } from './styles/HeaderStyle2'
import { HeaderStyle3 } from './styles/HeaderStyle3'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  switch (header.style) {
    case 'style2':
      return <HeaderStyle2 header={header} />
    case 'style3':
      return <HeaderStyle3 header={header} />
    case 'style1':
    default:
      return <HeaderStyle1 header={header} />
  }
}
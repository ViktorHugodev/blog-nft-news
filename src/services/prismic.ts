import Prismic from '@prismicio/client'
import {DefaultClient} from "@prismicio/client/types/client"

export function getPrismicClient(req?: unknown): DefaultClient{
  const prismic = Prismic.client(
    process.env.PRISMIC_END_POINT,
    {
      req,
      accessToken: process.env.PRISMIC_ACESS_TOKEN
    }
  )
  
  return prismic
}
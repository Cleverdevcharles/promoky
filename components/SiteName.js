import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getData } from '../utils/fetchData'

function SiteName({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.title}</>
}

export function AboutSite({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.about}</>
}

export function SiteEmail({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.email}</>
}

export function SitePhone({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.phone}</>
}

export function SiteTerms_Conditions({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.terms_conditions}</>
}
export function SitePrivacy_Policy({ site }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return <>{site.privacy_policy}</>
}

export async function getServerSideProps({ query, p }) {
  const page = query.page || 1
  const search = query.search || 'all'

  const res = await getData(`site?limit=${page * 1}&title=${search}`)

  // server side rendering
  return {
    props: {
      sites: res.sites,
      result: res.result,
    }, // will be passed to the page component as props
  }
}

export default SiteName

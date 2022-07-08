import React, {useState} from 'react'
import filterSearch from '../utils/filterSearch'
import {useRouter} from 'next/router'
import Link from  'next/link'

const Sort = ({state, sites, setSites}) => {
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')

    const router = useRouter()

    const handleSort = (e) => {
        setSort(e.target.value)
        filterSearch({router, sort: e.target.value})
        // router.push(`/shop/?search=${search}`)

    }

    return (
        <>
        <div className="shop-shorter">
            <div className="single-shorter">
                <label>Sort By :</label>
                <select value={sort} onChange={handleSort}>
                    <option selected="selected">Name</option>
                    <option value="-createdAt">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="-sold">Best sales</option>
                    <option value="-price">Price: Hight-Low</option>
                    <option value="price">Price: Low-Hight</option>
                </select>
            </div>
        </div>
        </>
    )
}

export default Sort

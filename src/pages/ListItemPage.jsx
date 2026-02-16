import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../components/Button'
import {
  createCategory,
  createItem,
  fetchCategories,
  fetchItems,
  getItemPhotoUrl,
} from '../services/items'

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleDateString('id-ID')
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Gagal membaca file foto'))
    reader.readAsDataURL(file)
  })
}

function ListItemPage({ token }) {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [isSubmittingItem, setIsSubmittingItem] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [itemForm, setItemForm] = useState({
    name: '',
    item_code: '',
    category_id: '',
    stock: 0,
    photo_base64: '',
    photo_content_type: 'image/jpeg',
  })
  const [photoPreview, setPhotoPreview] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [categoryData, itemData] = await Promise.all([
        fetchCategories(token),
        fetchItems(token),
      ])
      setCategories(categoryData)
      setItems(itemData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const categoryNameById = useMemo(() => {
    const map = new Map()
    categories.forEach((category) => {
      map.set(category.id, category.name)
    })
    return map
  }, [categories])

  const isCategoryValid = categoryName.trim().length > 0
  const isItemValid =
    itemForm.name.trim().length > 0 &&
    itemForm.item_code.trim().length > 0 &&
    Number(itemForm.category_id) > 0 &&
    Number(itemForm.stock) >= 0 &&
    itemForm.photo_base64.length > 0

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    if (!isCategoryValid) {
      return
    }
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmittingCategory(true)
    try {
      await createCategory({ name: categoryName.trim(), token })
      setCategoryName('')
      setSuccessMessage('Kategori berhasil ditambahkan.')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const handleItemInputChange = (event) => {
    const { name, value } = event.target
    setItemForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setItemForm((prev) => ({
        ...prev,
        photo_base64: '',
        photo_content_type: 'image/jpeg',
      }))
      setPhotoPreview('')
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      setItemForm((prev) => ({
        ...prev,
        photo_base64: dataUrl,
        photo_content_type: file.type || 'image/jpeg',
      }))
      setPhotoPreview(dataUrl)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleCreateItem = async (event) => {
    event.preventDefault()
    if (!isItemValid) {
      return
    }
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmittingItem(true)
    try {
      await createItem({
        token,
        payload: {
          name: itemForm.name.trim(),
          item_code: itemForm.item_code.trim().toUpperCase(),
          category_id: Number(itemForm.category_id),
          stock: Number(itemForm.stock),
          photo_base64: itemForm.photo_base64,
          photo_content_type: itemForm.photo_content_type,
        },
      })
      setItemForm({
        name: '',
        item_code: '',
        category_id: '',
        stock: 0,
        photo_base64: '',
        photo_content_type: 'image/jpeg',
      })
      setPhotoPreview('')
      setSuccessMessage('Item berhasil ditambahkan.')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmittingItem(false)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Item</h1>
        <p className="text-sm text-slate-500">
          Kelola kategori dan item rental dari satu halaman.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Buat Kategori</h2>
            <button
              type="button"
              onClick={() => setShowCategoryForm((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {showCategoryForm ? 'Tutup Form' : 'Buka Form'}
            </button>
          </div>

          {showCategoryForm ? (
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="category_name" className="text-xs font-semibold text-slate-600">
                  Nama Kategori
                </label>
                <input
                  id="category_name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                  placeholder="Contoh: Mobil SUV"
                  required
                />
              </div>
              <div className="max-w-[220px]">
                <Button type="submit" isLoading={isSubmittingCategory} disabled={!isCategoryValid}>
                  Tambah Kategori
                </Button>
              </div>
            </form>
          ) : (
            <p className="mb-3 text-sm text-slate-500">Form kategori disembunyikan.</p>
          )}

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-600">Kategori Tersedia</p>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada kategori.</p>
              ) : (
                categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {category.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Tambah Item</h2>
            <button
              type="button"
              onClick={() => setShowItemForm((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {showItemForm ? 'Tutup Form' : 'Buka Form'}
            </button>
          </div>

          {showItemForm ? (
            <form onSubmit={handleCreateItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="item_name" className="text-xs font-semibold text-slate-600">
                Nama Item
              </label>
              <input
                id="item_name"
                name="name"
                value={itemForm.name}
                onChange={handleItemInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="item_code" className="text-xs font-semibold text-slate-600">
                Kode Barang
              </label>
              <input
                id="item_code"
                name="item_code"
                value={itemForm.item_code}
                onChange={handleItemInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                placeholder="Contoh: SUV001"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category_id" className="text-xs font-semibold text-slate-600">
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                value={itemForm.category_id}
                onChange={handleItemInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="stock" className="text-xs font-semibold text-slate-600">
                Stok
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                value={itemForm.stock}
                onChange={handleItemInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="photo" className="text-xs font-semibold text-slate-600">
                Foto Barang
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-2 file:py-1 file:text-xs file:font-semibold"
                required
              />
            </div>

            {photoPreview ? (
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs font-semibold text-slate-600">Preview Foto</p>
                <img
                  src={photoPreview}
                  alt="Preview item"
                  className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                />
              </div>
            ) : null}

            <div className="sm:col-span-2 sm:max-w-[220px]">
              <Button type="submit" isLoading={isSubmittingItem} disabled={!isItemValid}>
                Tambah Item
              </Button>
            </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Form item disembunyikan.</p>
          )}
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Daftar Item</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2">Foto</th>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Nama Item</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Stok</th>
                <th className="px-4 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    {isLoading ? 'Memuat data item...' : 'Belum ada item.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      <img
                        src={getItemPhotoUrl(item.id)}
                        alt={item.name}
                        className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold text-slate-800">{item.item_code}</td>
                    <td className="px-4 py-2 text-slate-700">{item.name}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {categoryNameById.get(item.category_id) || '-'}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{item.stock}</td>
                    <td className="px-4 py-2 text-slate-700">{formatDate(item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ListItemPage

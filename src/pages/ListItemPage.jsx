import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../components/Button'
import {
  createItem,
  createCategory,
  fetchCategories,
  fetchItems,
  getItemPhotoUrl,
  getItemPhotoAdditionalUrl,
  deleteItem,
  updateItem,
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

function ListItemPage({ token, userRole }) {
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
    photos_base64: [],
  })
  const [photoPreviews, setPhotoPreviews] = useState([])

  // Edit State
  const [editingItem, setEditingItem] = useState(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    item_code: '',
    category_id: '',
    stock: 0,
    photos_base64: [],
  })
  const [editPhotoPreviews, setEditPhotoPreviews] = useState([])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStock, setFilterStock] = useState('')

  // Viewer state
  const [viewerItem, setViewerItem] = useState(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  const handleOpenViewer = (item) => {
    setViewerItem(item)
    setViewerIndex(0)
  }

  const handleCloseViewer = () => {
    setViewerItem(null)
  }

  const handleNextPhoto = () => {
    if (viewerItem) {
      const total = 1 + (viewerItem.additional_photos?.length || 0)
      setViewerIndex((prev) => (prev + 1) % total)
    }
  }

  const handlePrevPhoto = () => {
    if (viewerItem) {
      const total = 1 + (viewerItem.additional_photos?.length || 0)
      setViewerIndex((prev) => (prev - 1 + total) % total)
    }
  }

  const getViewerUrl = () => {
    if (!viewerItem) return ''
    if (viewerIndex === 0) return getItemPhotoUrl(viewerItem.id)
    const extraPhoto = viewerItem.additional_photos[viewerIndex - 1]
    return getItemPhotoAdditionalUrl(viewerItem.id, extraPhoto.id)
  }

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [categoryData, itemData] = await Promise.all([
        fetchCategories(token),
        fetchItems(token, {
          q: searchQuery,
          category_id: filterCategory || undefined,
          in_stock: filterStock || undefined,
        }),
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
  }, [loadData]) // Only loadData is dependency, we will trigger it on form submit to avoid infinite loops if typing

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
    Number(itemForm.stock) >= 0

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
    if (name === 'stock') {
      setItemForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }))
    } else {
      setItemForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePhotoChange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      setItemForm((prev) => ({
        ...prev,
        photos_base64: [],
      }))
      setPhotoPreviews([])
      return
    }

    try {
      const urls = await Promise.all(files.map((file) => fileToDataUrl(file)))
      setItemForm((prev) => ({
        ...prev,
        photos_base64: urls,
      }))
      setPhotoPreviews(urls)
    } catch (error) {
      setErrorMessage('Ada file gambar yang tidak valid.')
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
          photos_base64: itemForm.photos_base64,
        },
      })
      setItemForm({
        name: '',
        item_code: '',
        category_id: '',
        stock: 0,
        photos_base64: [],
      })
      setPhotoPreviews([])
      setSuccessMessage('Item berhasil ditambahkan.')
      document.getElementById('photo').value = ''
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmittingItem(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus item ini? Data yang terhapus tidak dapat dikembalikan.')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    try {
      await deleteItem({ itemId, token })
      setSuccessMessage('Item berhasil dihapus.')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleOpenEdit = (item) => {
    setErrorMessage('')
    setSuccessMessage('')
    setEditingItem(item)
    setEditForm({
      name: item.name,
      item_code: item.item_code,
      category_id: item.category_id,
      stock: item.stock,
      photos_base64: [],
    })
    // Pre-fill existing previews from backend URL if we want, or just let users replace entirely.
    // For simplicity, we just clear and ask them to re-upload if they want to change photos.
    // But we map existing images to previews so they know what is there.
    const existings = [getItemPhotoUrl(item.id)]
    if (item.additional_photos) {
      item.additional_photos.forEach(p => existings.push(getItemPhotoAdditionalUrl(item.id, p.id)))
    }
    setEditPhotoPreviews(existings)
  }

  const handleCloseEdit = () => {
    setEditingItem(null)
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    if (name === 'stock') {
      setEditForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }))
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditPhotoChange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      setEditForm((prev) => ({
        ...prev,
        photos_base64: [],
      }))
      setEditPhotoPreviews([])
      return
    }

    try {
      const urls = await Promise.all(files.map((file) => fileToDataUrl(file)))
      setEditForm((prev) => ({
        ...prev,
        photos_base64: urls,
      }))
      setEditPhotoPreviews(urls)
    } catch (error) {
      setErrorMessage('Ada file gambar yang tidak valid.')
    }
  }

  const handleUpdateItem = async (event) => {
    event.preventDefault()
    if (!editForm.name || !editForm.item_code || !editForm.category_id) return

    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmittingEdit(true)
    try {
      // Only send photos_base64 if they explicitly uploaded new photos (it will replace existing).
      // Otherwise, we send undefined/null so backend ignores it and keeps old photos.
      let payloadPhotos = undefined
      if (editForm.photos_base64.length > 0) {
        payloadPhotos = editForm.photos_base64
      }

      await updateItem({
        itemId: editingItem.id,
        token,
        payload: {
          name: editForm.name.trim(),
          item_code: editForm.item_code.trim().toUpperCase(),
          category_id: Number(editForm.category_id),
          stock: Number(editForm.stock),
          photos_base64: payloadPhotos,
        },
      })
      setSuccessMessage('Item berhasil diperbarui.')
      handleCloseEdit()
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmittingEdit(false)
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

      {userRole === 'ADMIN' ? (
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={itemForm.stock}
                    onChange={handleItemInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="photo" className="text-xs font-semibold text-slate-600">
                    Foto Barang (Bisa Lebih Dari 1)
                  </label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-2 file:py-1 file:text-xs file:font-semibold"
                  />
                </div>

                {photoPreviews.length > 0 ? (
                  <div className="sm:col-span-2">
                    <p className="mb-1 text-xs font-semibold text-slate-600">Preview Foto ({photoPreviews.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {photoPreviews.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
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
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex sm:items-center sm:justify-between">
          <h2 className="mb-2 text-sm font-semibold text-slate-800 sm:mb-0">Daftar Item</h2>

          <form
            onSubmit={(e) => { e.preventDefault(); loadData() }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center text-sm"
          >
            <input
              type="text"
              placeholder="Cari nama/kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
            >
              <option value="">Semua Stok</option>
              <option value="true">Ada Stok (&gt; 0)</option>
              <option value="false">Habis (0)</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Cari
            </button>
          </form>
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
                {userRole === 'ADMIN' && <th className="px-4 py-2">Aksi</th>}
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
                      <div className="relative inline-block">
                        <img
                          src={getItemPhotoUrl(item.id)}
                          alt={item.name}
                          onClick={() => handleOpenViewer(item)}
                          className="h-10 w-10 cursor-pointer rounded-md border border-slate-200 object-cover transition hover:opacity-75"
                        />
                        {item.additional_photos && item.additional_photos.length > 0 && (
                          <span className="pointer-events-none absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white shadow">
                            +{item.additional_photos.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-semibold text-slate-800">{item.item_code}</td>
                    <td className="px-4 py-2 text-slate-700">{item.name}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {categoryNameById.get(item.category_id) || '-'}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{item.stock}</td>
                    <td className="px-4 py-2 text-slate-700">{formatDate(item.created_at)}</td>
                    {userRole === 'ADMIN' && (
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="rounded bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {viewerItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-full max-w-[90vw] flex-col items-center">
            <button
              onClick={handleCloseViewer}
              className="absolute -top-12 right-0 text-xl font-bold text-white transition hover:text-slate-300"
            >
              Tutup ✕
            </button>
            <img
              src={getViewerUrl()}
              alt={viewerItem.name}
              className="max-h-[80vh] w-auto rounded-xl bg-white object-contain shadow-2xl"
            />
            <div className="mt-4 flex items-center gap-6 text-white">
              <button
                onClick={handlePrevPhoto}
                className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white/40"
              >
                ❮ Sebelumnya
              </button>
              <span className="text-sm font-semibold tracking-wider">
                {viewerIndex + 1} / {1 + (viewerItem.additional_photos?.length || 0)}
              </span>
              <button
                onClick={handleNextPhoto}
                className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white/40"
              >
                Selanjutnya ❯
              </button>
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-white/80">{viewerItem.name}</p>
          </div>
        </div>
      ) : null}

      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Edit Item</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="edit_name" className="text-xs font-semibold text-slate-600">Nama Item</label>
                  <input
                    id="edit_name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditInputChange}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit_item_code" className="text-xs font-semibold text-slate-600">Kode Item</label>
                  <input
                    id="edit_item_code"
                    name="item_code"
                    value={editForm.item_code}
                    onChange={handleEditInputChange}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit_category_id" className="text-xs font-semibold text-slate-600">Kategori</label>
                  <select
                    id="edit_category_id"
                    name="category_id"
                    value={editForm.category_id}
                    onChange={handleEditInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit_stock" className="text-xs font-semibold text-slate-600">Stok</label>
                  <input
                    id="edit_stock"
                    name="stock"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editForm.stock}
                    onChange={handleEditInputChange}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-300"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="edit_photo" className="text-xs font-semibold text-slate-600">
                    Timpa Foto (Kosongkan jika tidak diubah)
                  </label>
                  <input
                    id="edit_photo"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditPhotoChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-2 file:py-1 file:text-xs file:font-semibold"
                  />
                </div>
                {editPhotoPreviews.length > 0 ? (
                  <div className="sm:col-span-2">
                    <p className="mb-1 text-xs font-semibold text-slate-600">Preview Foto</p>
                    <div className="flex flex-wrap gap-2">
                      {editPhotoPreviews.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSubmittingEdit}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <Button type="submit" isLoading={isSubmittingEdit}>Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListItemPage

interface Product {
  name: string
  description: string
  image: string
  onSale: boolean
}

export function ProductTile({ product }: { product: Product }) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <img className="h-48 w-full object-cover" src={product.image} alt="" />
      <div className="p-4 space-y-2">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
        {product.onSale && <span className="text-red-500 font-bold">SALE</span>}
        <button className="w-full h-10 rounded-md bg-blue-500 text-white">
          Add to Cart
        </button>
      </div>
    </div>
  )
}

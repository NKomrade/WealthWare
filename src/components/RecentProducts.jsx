import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

const popularProducts = [
  {
    id: '3432',
    product_name: 'Macbook M1 Pro 14"',
    product_price: '$1499.00',
    product_stock: 341,
  },
  {
    id: '7633',
    product_name: 'Samsung Galaxy Buds 2',
    product_price: '$399.00',
    product_stock: 24,
  },
  {
    id: '6534',
    product_name: 'Asus Zenbook Pro',
    product_price: '$899.00',
    product_stock: 56,
  },
  {
    id: '9234',
    product_name: 'LG Flex Canvas',
    product_price: '$499.00',
    product_stock: 98,
  },
  {
    id: '4314',
    product_name: 'Apple Magic Touchpad',
    product_price: '$699.00',
    product_stock: 0,
  },
  {
    id: '4342',
    product_name: 'Nothing Earbuds One',
    product_price: '$399.00',
    product_stock: 453,
  },
];

function PopularProducts() {
  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Popular Products</h2>
      <ul className="divide-y divide-gray-300">
        {popularProducts.map((product) => (
          <li key={product.id} className="py-3 flex justify-between items-center">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 pr-4 hover:underline hover:text-blue-500"
            >
              <p className="font-medium text-gray-800">{product.product_name}</p>
              <span
                className={classNames(
                  product.product_stock === 0
                    ? 'text-red-500'
                    : product.product_stock > 50
                    ? 'text-green-500'
                    : 'text-orange-500',
                  'text-sm font-medium'
                )}
              >
                {product.product_stock === 0
                  ? 'Out of Stock'
                  : `${product.product_stock} in Stock`}
              </span>
            </Link>
            <span className="text-sm text-gray-600 font-medium">{product.product_price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PopularProducts;
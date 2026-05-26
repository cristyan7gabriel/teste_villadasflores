import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// src/main.js
import { client } from './sanity.js';

async function exibirProdutos() {
  const container = document.getElementById('vitrine-produtos');

  try {
    // Busca os produtos e pede especificamente a URL da imagem
    const query = `*[_type == "product"]{
      _id,
      name,
      price,
      "imageUrl": image.asset->url
    }`;

    const produtos = await client.fetch(query);

    // Se não tiver produtos, avisa na tela
    if (produtos.length === 0) {
      container.innerHTML = '<p class="text-gray-500">Nenhum produto cadastrado ainda.</p>';
      return;
    }

    // Monta os cards HTML usando os dados do Sanity + classes do Tailwind
    container.innerHTML = produtos.map(produto => `
      <div class="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        ${produto.imageUrl
        ? `<img src="${produto.imageUrl}" alt="${produto.name}" class="w-full h-48 object-cover rounded-md mb-4">`
        : `<div class="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">Sem foto</div>`
      }
        <h2 class="text-lg font-semibold text-gray-800">${produto.name}</h2>
        <p class="text-green-600 font-bold mt-2">R$ ${produto.price}</p>
      </div>
    `).join('');

  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar a vitrine.</p>';
  }
}

// Inicia a função assim que a página carrega
exibirProdutos();
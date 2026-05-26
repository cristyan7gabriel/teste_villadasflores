import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { client } from '../../sanity';
import { productsData as localProductsData } from '../../data/productsData';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product, onBuyClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="product-card group bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg border border-primary/5 hover:shadow-xl transition-all duration-500 flex flex-col">
      <div className="relative h-36 md:h-80 overflow-hidden bg-background/50 group/image">
        <img 
          src={images[currentImageIndex]} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 md:p-2 rounded-full text-dark opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white z-10 shadow-sm"
            >
              <ChevronLeft size={16} className="md:w-5 md:h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 md:p-2 rounded-full text-dark opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white z-10 shadow-sm"
            >
              <ChevronRight size={16} className="md:w-5 md:h-5" />
            </button>
            
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-3 md:p-8 flex flex-col flex-grow text-center items-center">
        <h4 className="font-sans font-bold text-[13px] md:text-lg text-dark mb-1 md:mb-2 line-clamp-2 leading-tight">{product.title}</h4>
        
        {product.observation && (
          <p className="font-sans text-[9px] md:text-xs text-dark/70 leading-[1.1] mb-2 px-1 text-center font-medium italic">
            {product.observation}
          </p>
        )}
        
        <div className="mt-auto mb-3 md:mb-6 flex flex-col items-center">
          <p className="font-mono text-[10px] md:text-sm text-dark/70 mb-0 md:mb-1">{product.installments}</p>
          <p className="font-serif italic text-xl md:text-4xl text-accent font-semibold leading-none mt-1 md:mt-2">R$ {product.price}</p>
        </div>

        <button 
          onClick={() => onBuyClick(product.title)}
          className="group/btn relative w-full overflow-hidden rounded-[1rem] md:rounded-full bg-primary text-background py-2 md:py-4 px-2 md:px-6 flex items-center justify-center gap-1 md:gap-2 hover:scale-[1.02] transition-transform duration-300 ease-out"
        >
          <span className="absolute inset-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></span>
          <span className="relative font-sans tracking-wide text-[11px] md:text-sm font-semibold z-10 flex items-center gap-1 md:gap-2">
            <span className="hidden sm:inline">Comprar agora</span><span className="sm:hidden">Comprar</span> <ShoppingBag size={14} className="md:w-[18px] md:h-[18px]" />
          </span>
        </button>
      </div>
    </div>
  );
};

gsap.registerPlugin(ScrollTrigger);

export const ProductCatalog = () => {
  const catalogRef = useRef(null);
  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `
          *[_type == "product"] {
            _id,
            name,
            price,
            observation,
            installments,
            "image": image.asset->url,
            "gallery": gallery[].asset->url,
            "category": category->name
          }
        `;
        const products = await client.fetch(query);

        let mergedData = JSON.parse(JSON.stringify(localProductsData));

        products.forEach(product => {
          const catName = product.category || 'Outros';
          const newItem = {
            id: product._id,
            title: product.name,
            price: product.price,
            observation: product.observation,
            installments: product.installments,
            image: product.image,
            gallery: product.gallery || []
          };

          const existingCategoryIndex = mergedData.findIndex(c => c.category === catName);
          
          if (existingCategoryIndex >= 0) {
            mergedData[existingCategoryIndex].items.push(newItem);
          } else {
            mergedData.push({
              category: catName,
              items: [newItem]
            });
          }
        });

        setProductsData(mergedData);
      } catch (error) {
        console.error("Erro ao buscar produtos do Sanity:", error);
        setProductsData(localProductsData); // Fallback to local data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoading || productsData.length === 0) return;

    const ctx = gsap.context(() => {
      // Animate category titles
      gsap.utils.toArray('.category-title').forEach(title => {
        gsap.fromTo(title,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: title,
              start: "top 85%",
            }
          }
        );
      });

      // Animate product cards
      gsap.utils.toArray('.product-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.product-card');
        gsap.fromTo(cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 80%",
            }
          }
        );
      });
    }, catalogRef);

    return () => ctx.revert();
  }, [isLoading, productsData]);

  const handleBuyClick = (productName) => {
    const phoneNumber = "556233002097";
    const text = `Olá, gostaria de comprar o produto: ${productName}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <section id="catalogo" ref={catalogRef} className="py-24 px-3 md:px-12 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="font-sans text-xl md:text-2xl tracking-widest uppercase mb-4 opacity-80">Nossa Vitrine</h2>
        <p className="font-serif text-4xl md:text-6xl italic text-primary">Beleza em cada detalhe.</p>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : productsData.length === 0 ? (
        <div className="w-full text-center py-20 text-dark/70">
          <p>Nenhum produto encontrado no catálogo.</p>
        </div>
      ) : (
      <div className="space-y-24">
        {productsData.map((category, index) => (
          <div key={index} id={category.category.replace(/\s+/g, '-').toLowerCase()} className="category-section">
            <h3 className="category-title font-sans font-semibold text-2xl md:text-3xl text-dark mb-8 border-b border-primary/20 pb-4">
              {category.category}
            </h3>
            
            <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {category.items.map((product) => (
                <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </section>
  );
};

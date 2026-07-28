export interface ProductMetadata {
  imageUrl: string;
  tags: string[];
  size: string;
  description: string;
}

export function getProductMetadata(product: { 
  Id: number; 
  Name: string | null;
  Image?: string | null;
  Tags?: string | null;
  Description?: string | null;
  Details?: string | null;
  Size?: string | null;
}): ProductMetadata {
  const images = [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Folded towels/fabrics
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80', // Wrinkled white linen texture
    'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&q=80', // Thread spools
    'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80', // Yarn spools on loom
    'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80', // Loom threads close up
    'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=600&q=80', // Heap of folded fabrics
  ];

  const id = product.Id || 0;
  const firstImage = product.Image ? product.Image.split(',')[0].trim() : null;
  const imageUrl = firstImage ? firstImage : images[id % images.length];

  const name = product.Name || 'Premium Fabric';
  let tags = product.Tags 
    ? product.Tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Pure Cotton', 'Traditional Weave'];
  let size = product.Size || '44" Width (Sold by Meter)';
  let description = product.Description || 'A premium quality handloom woven fabric. Meticulously crafted with a traditional border design. Ideal for ethnic wear, formal occasions, and custom tailoring.';

  if (!product.Tags && !product.Description && !product.Size) {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('border')) {
      tags = ['Pure Cotton', 'Traditional Border', 'Loom Woven'];
      size = '4.5 Meters (Standard Dhoti)';
      description = 'Authentic handloom dhoti fabric featuring a premium traditional border. Extremely soft, breathable, and designed for comfort on celebratory occasions.';
    } else if (lowerName.includes('cross')) {
      tags = ['Cross Weave', 'Durable Cotton', 'Textured'];
      size = '50" Width (Sold by Meter)';
      description = 'Engineered cross-weave cotton fabric providing enhanced texture and structural integrity. Excellent choice for shirts, kurtas, and apparel design.';
    } else if (lowerName.includes('kavi')) {
      tags = ['Saffron/Kavi', 'Temple Border', 'Festive'];
      size = '2.25 Meters (Standard Angavastram)';
      description = 'Traditional Kavi border weave, highly sought after for festive and spiritual occasions. Made from pure high-grade yarn with a rich color fastness.';
    } else if (lowerName.includes('cream')) {
      tags = ['Cream Shade', 'Organic Cotton', 'Eco-friendly'];
      size = '44" Width (Standard)';
      description = 'Naturally toned cream fabric with a beautiful organic texture. Unprocessed chemical-free weave that is gentle on the skin and highly breathable.';
    } else if (lowerName.includes('pulli')) {
      tags = ['Dotted Pattern', 'Fine Yarn', 'Dobby Design'];
      size = '44" Width (Fine Loom)';
      description = 'Elegant dotted "pulli" design woven on a dobby loom using fine-count 2/40s yarn. Adds subtle detail to traditional garments with excellent drape.';
    }
  }

  return { imageUrl, tags, size, description };
}

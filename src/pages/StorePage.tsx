
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, Heart, Share2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/components/ui/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

// Define reliable fallback images
const fallbackImages = {
  equipment: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format",
  mindfulness: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format",
  featured: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format"
};

const StorePage = () => {
  const { isSubscribed, isAdmin } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  const products = [
    {
      id: 1,
      name: 'Premium Yoga Mat',
      price: 199.99,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800',
      description: 'Extra thick, non-slip yoga mat perfect for all types of yoga.',
      category: 'equipment',
      amazonLink: 'https://www.amazon.com/s?k=yoga+mat'
    },
    {
      id: 2,
      name: 'Resistance Band Set',
      price: 129.99,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800',
      description: 'Set of 5 resistance bands for strength training and rehabilitation.',
      category: 'equipment',
      amazonLink: 'https://www.amazon.com/s?k=resistance+bands'
    },
    {
      id: 3,
      name: 'Plant-based Protein Powder',
      price: 159.99,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c1b1d4b13?q=80&w=2340&q=80',
      description: 'Organic plant-based protein with 25g protein per serving.',
      category: 'nutrition',
      amazonLink: 'https://www.amazon.com/s?k=plant+based+protein'
    },
    {
      id: 4,
      name: 'Fitness Tracker Watch',
      price: 399.99,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=2488&q=80',
      description: 'Tracks steps, sleep, heart rate, and workouts with 7-day battery life.',
      category: 'equipment',
      amazonLink: 'https://www.amazon.com/s?k=fitness+tracker'
    },
    {
      id: 5,
      name: 'Meditation Cushion',
      price: 139.99,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2340&q=80',
      description: 'Comfortable buckwheat-filled cushion for meditation practice.',
      category: 'mindfulness',
      amazonLink: 'https://www.amazon.com/s?k=meditation+cushion'
    },
    {
      id: 6,
      name: 'BCAA Supplement',
      price: 99.99,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1579722819315-2e21e1013f90?q=80&w=2340&q=80',
      description: 'Branched-Chain Amino Acids for muscle recovery and growth.',
      category: 'nutrition',
      amazonLink: 'https://www.amazon.com/s?k=bcaa+supplement'
    },
    {
      id: 7,
      name: 'Premium Dumbbells Set',
      price: 299.99,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2338&q=80',
      description: 'Adjustable dumbbell set with rack, perfect for home workouts.',
      category: 'equipment',
      amazonLink: 'https://www.amazon.com/s?k=dumbbells+set'
    },
    {
      id: 8,
      name: 'Foam Roller',
      price: 89.99,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1607962372875-5e3b2cb69148?q=80&w=2340&q=80',
      description: 'High-density foam roller for muscle recovery and myofascial release.',
      category: 'equipment',
      amazonLink: 'https://www.amazon.com/s?k=foam+roller'
    },
    {
      id: 9,
      name: 'Protein Bars - Box of 12',
      price: 129.99,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=2340&q=80',
      description: 'High protein, low sugar bars for on-the-go nutrition.',
      category: 'nutrition',
      amazonLink: 'https://www.amazon.com/s?k=protein+bars'
    }
  ];

  const handleBuyNow = (product: any) => {
    if (isAdmin) {
      toast({
        title: "Admin Access",
        description: "As an admin, you have access to purchase any product.",
      });
      return;
    }
    
    if (isSubscribed) {
      toast({
        title: "Premium Member",
        description: "As a premium subscriber, you receive 10% off your purchase.",
      });
    }
    
    window.open(product.amazonLink, '_blank');
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };
  
  // Helper function to get image with fallback
  const getImageWithFallback = (product: any) => {
    if (imagesLoaded[product.id] === false) {
      // If we know this image failed, use fallback
      return fallbackImages[product.category] || fallbackImages.featured;
    }
    return product.image;
  };
  
  // Handle image loading error
  const handleImageError = (productId: number) => {
    setImagesLoaded(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Wellness Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            High-quality products to support your wellness journey, carefully selected by our fitness experts.
          </p>
          
          {!isSubscribed && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-purple-800 font-medium mb-2">Subscribe to get 10% discount on all store items!</p>
              <Button 
                onClick={handleSubscribe} 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                View Subscription Plans
              </Button>
            </div>
          )}
          
          {isSubscribed && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-green-800 font-medium">
                {isAdmin ? 'Admin account: Full access to premium features!' : 'Premium subscriber: Enjoy your 10% discount on all products!'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 lg:col-span-2 overflow-hidden rounded-lg shadow-lg">
            <AspectRatio ratio={16/9} className="bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800" 
                alt="Featured fitness equipment" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImages.featured;
                }}
              />
            </AspectRatio>
            <div className="p-4 bg-white">
              <h3 className="font-bold text-lg">Summer Sale - Up to 30% Off</h3>
              <p className="text-gray-600">Limited time offer on premium fitness equipment</p>
            </div>
          </div>
          
          <div className="md:col-span-1 lg:col-span-1 overflow-hidden rounded-lg shadow-lg">
            <AspectRatio ratio={1/1} className="bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800" 
                alt="Protein supplements" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImages.nutrition;
                }}
              />
            </AspectRatio>
            <div className="p-4 bg-white">
              <h3 className="font-bold text-lg">Nutrition Essentials</h3>
              <p className="text-gray-600">Fuel your workouts</p>
            </div>
          </div>
          
          <div className="md:col-span-1 lg:col-span-1 overflow-hidden rounded-lg shadow-lg">
            <AspectRatio ratio={1/1} className="bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1518609571773-39b7d303a87b?q=80&w=800" 
                alt="Mindfulness products" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImages.mindfulness;
                }}
              />
            </AspectRatio>
            <div className="p-4 bg-white">
              <h3 className="font-bold text-lg">Mindfulness Collection</h3>
              <p className="text-gray-600">For mental wellness</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-center">
            <TabsList className="mb-8">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isDiscounted={isSubscribed}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="equipment">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.category === 'equipment').map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isDiscounted={isSubscribed}
                  onBuyNow={handleBuyNow} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.category === 'nutrition').map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isDiscounted={isSubscribed}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="mindfulness">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.category === 'mindfulness').map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isDiscounted={isSubscribed}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    rating: number;
    image: string;
    description: string;
    category: string;
    amazonLink: string;
  };
  isDiscounted?: boolean;
  onBuyNow: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isDiscounted, onBuyNow }) => {
  const discountedPrice = isDiscounted ? (product.price * 0.9).toFixed(2) : product.price.toFixed(2);
  const [imageError, setImageError] = useState(false);

  const getFallbackImage = () => {
    return fallbackImages[product.category] || fallbackImages.equipment;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="h-48 overflow-hidden">
        <img 
          src={imageError ? getFallbackImage() : product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-1">
              {isDiscounted ? (
                <div className="flex items-center">
                  <span className="line-through text-gray-400">{product.price.toFixed(2)} AED</span>
                  <span className="ml-2 text-green-600 font-medium">{discountedPrice} AED</span>
                  <Badge className="ml-2 bg-green-500 text-xs">10% OFF</Badge>
                </div>
              ) : (
                <span>{product.price.toFixed(2)} AED</span>
              )}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm">{product.description}</p>
        <div className="flex items-center mt-2 text-amber-500">
          <Star className="fill-amber-500 stroke-amber-500 h-4 w-4" />
          <span className="ml-1 text-sm">{product.rating}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600"
          onClick={() => onBuyNow(product)}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Buy Now</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
      <div className="flex border-t">
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none border-r"
        >
          <Heart className="h-4 w-4 mr-1" />
          <span className="text-xs">Save</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none"
        >
          <Share2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </Card>
  );
};

export default StorePage;

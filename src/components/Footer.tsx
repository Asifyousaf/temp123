
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert email to newsletter_subscribers table
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscription successful!",
          description: "Thank you for subscribing to our newsletter",
          variant: "default"
        });
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription failed",
        description: "There was a problem subscribing to the newsletter. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">NutriBuddy</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your personalized wellness companion, helping you achieve your fitness and nutrition goals with AI-powered guidance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul>
              <li className="mb-2">
                <Link to="/workouts" className="text-sm text-gray-600 hover:text-purple-600">Workouts</Link>
              </li>
              <li className="mb-2">
                <Link to="/nutrition" className="text-sm text-gray-600 hover:text-purple-600">Nutrition</Link>
              </li>
              <li className="mb-2">
                <Link to="/mindfulness" className="text-sm text-gray-600 hover:text-purple-600">Mindfulness</Link>
              </li>
              <li className="mb-2">
                <Link to="/community" className="text-sm text-gray-600 hover:text-purple-600">Community</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul>
              <li className="mb-2">
                <Link to="/about-us" className="text-sm text-gray-600 hover:text-purple-600">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/careers" className="text-sm text-gray-600 hover:text-purple-600">Careers</Link>
              </li>
              <li className="mb-2">
                <Link to="/press" className="text-sm text-gray-600 hover:text-purple-600">Press</Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-purple-600">Blog</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul>
              <li className="mb-2">
                <Link to="/help-center" className="text-sm text-gray-600 hover:text-purple-600">Help Center</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-purple-600">Privacy Policy</Link>
              </li>
              <li className="mb-2">
                <Link to="/terms-of-service" className="text-sm text-gray-600 hover:text-purple-600">Terms of Service</Link>
              </li>
              <li className="mb-2">
                <Link to="/cookie-policy" className="text-sm text-gray-600 hover:text-purple-600">Cookie Policy</Link>
              </li>
              <li className="mb-2">
                <Link to="/safety-center" className="text-sm text-gray-600 hover:text-purple-600">Safety Center</Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-sm text-gray-600 hover:text-purple-600">Community Guidelines</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Join Our Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">Get the latest updates from NutriBuddy</p>
            <form className="flex flex-col" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                className="border rounded-md px-3 py-2 mb-3 text-sm text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {currentYear} NutriBuddy. All rights reserved.
            </p>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

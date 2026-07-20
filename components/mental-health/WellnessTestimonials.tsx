'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, Heart, Brain, Shield } from 'lucide-react';

const WellnessTestimonials = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      age: 28,
      avatar: "/api/placeholder/40/40",
      content: "The AI assistant has been incredibly helpful during my anxiety episodes. It provides instant support and practical coping strategies that actually work.",
      rating: 5,
      highlight: "Anxiety Support",
      icon: Brain,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Manager", 
      age: 35,
      avatar: "/api/placeholder/40/40",
      content: "The therapy sessions with licensed professionals have been life-changing. The platform made it so easy to find the right therapist for my needs.",
      rating: 5,
      highlight: "Professional Therapy",
      icon: Heart,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Emily Johnson",
      role: "Student",
      age: 22,
      avatar: "/api/placeholder/40/40",
      content: "I love how private and secure everything is. I can work on my mental health without any stigma or judgment. The progress tracking keeps me motivated.",
      rating: 5,
      highlight: "Privacy & Progress",
      icon: Shield,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "David Kim",
      role: "Entrepreneur",
      age: 41,
      avatar: "/api/placeholder/40/40",
      content: "The comprehensive approach combining AI support, expert consultations, and wellness tracking has helped me manage stress much better.",
      rating: 5,
      highlight: "Stress Management",
      icon: Brain,
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Lisa Thompson",
      role: "Teacher",
      age: 34,
      avatar: "/api/placeholder/40/40",
      content: "The personalized care plans are exactly what I needed. My therapist created a custom approach that fits my lifestyle and goals perfectly.",
      rating: 5,
      highlight: "Personalized Care",
      icon: Heart,
      color: "from-indigo-500 to-blue-500"
    },
    {
      name: "Alex Patel",
      role: "Healthcare Worker",
      age: 29,
      avatar: "/api/placeholder/40/40",
      content: "As someone in healthcare, I appreciate the professional standards. The quality of care is exceptional.",
      rating: 5,
      highlight: "Professional Quality",
      icon: Shield,
      color: "from-teal-500 to-green-500"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <motion.section 
      className="py-20 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of people who have transformed their mental health journey with our platform.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="h-8 w-8 text-gray-300" />
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-xl flex items-center justify-center`}>
                      <testimonial.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}, Age {testimonial.age}</p>
                    </div>
                  </div>

                  {/* Highlight */}
                  <div className={`mt-4 inline-flex items-center space-x-2 bg-gradient-to-r ${testimonial.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    <testimonial.icon className="h-3 w-3" />
                    <span>{testimonial.highlight}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        {/* <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-8"
          variants={itemVariants}
        >
          {[
            { number: "7K+", label: "People Helped", icon: Heart },
            { number: "98%", label: "Satisfaction Rate", icon: Star },
            { number: "24/7", label: "AI Support", icon: Brain },
            { number: "100%", label: "Secure & Private", icon: Shield }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div> */}

        {/* Bottom CTA */}
        {/* <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Community?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start your mental health journey today with our comprehensive platform designed for your wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-green-600 hover:text-green-600 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </motion.div> */}
      </div>
    </motion.section>
  );
};

export default WellnessTestimonials;

'use client'

import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { SelectValue } from '@radix-ui/react-select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '../../i18n/routing'
import { i18n } from '../../../i18n-config'


export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n

  const locale = useLocale()
  const t = useTranslations()
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        // Thêm animation class khi footer hiển thị
          document.documentElement.style.setProperty(
            '--footer-animation-delay',
            '0.5s'
          );
        }
      },
      { threshold: 0.1 }
    );
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const backToTopButton = document.getElementById('back-to-top');
      if (backToTopButton) {
        backToTopButton.classList.toggle('opacity-100', scrollTop > 300);
        backToTopButton.classList.toggle('opacity-0', scrollTop <= 300);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer 
      ref={footerRef} 
      className="bg-background text-foreground relative overflow-hidden border-t"
      style={{
        '--footer-animation-delay': '0s',
      } as React.CSSProperties}
    >
      {/* Back to Top Button */}
      <div className="w-full relative z-10">
        <Button
          id="back-to-top"
          variant="ghost"
          className="w-full rounded-none py-6 opacity-0 group transition-all duration-500 hover:bg-primary/90"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <ChevronUp className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1" />
              <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping opacity-0 group-hover:opacity-100" />
            </div>
            <span className="font-medium tracking-wide">{t('Footer.Back to top')}</span>
          </div>
        </Button>
      </div>
      
      {/* Main Footer Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-12 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Get to Know Us */}
          <Card className={`border-0 shadow-none bg-transparent transition-all duration-700 ${isVisible ? 'translate-x-0' : 'translate-x-10 opacity-0'}`}>
            <CardContent className="p-0 space-y-6">
              <div className="relative inline-block">
                <h3 className="text-xl font-bold tracking-tight">{t('Footer.Get to Know Us')}</h3>
                <div className={`absolute h-1 w-0 bg-primary bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`} />
              </div>
              <ul className="space-y-3">
                {[
                  { href: '/page/careers', text: t('Footer.Careers') },
                  { href: '/page/blog', text: t('Footer.Blog') },
                  { href: '/page/about-us', text: t('Footer.About name', { name: site.name }) }
                ].map((link, index) => (
                  <li key={index} className="overflow-hidden">
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <span className="w-0 group-hover:w-6 overflow-hidden transition-all duration-300 h-5 flex items-center">
                        <span className="transform translate-x-2">→</span>
                      </span>
                      <span className="group-hover:border-b group-hover:border-primary pb-1 transition-all duration-300">
                        {link.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Make Money with Us */}
          <Card className={`border-0 shadow-none bg-transparent transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardContent className="p-0 space-y-6">
              <div className="relative inline-block">
                <h3 className="text-xl font-bold tracking-tight">{t('Footer.Make Money with Us')}</h3>
                <div className={`absolute h-1 w-0 bg-primary bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`} />
              </div>
              <ul className="space-y-3">
                {[
                  { href: '/page/sell', text: t('Footer.Sell products on', { name: site.name }) },
                  { href: '/page/become-affiliate', text: t('Footer.Become an Affiliate') },
                  { href: '/page/advertise', text: t('Footer.Advertise Your Products') }
                ].map((link, index) => (
                  <li key={index} className="overflow-hidden">
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <span className="w-0 group-hover:w-6 overflow-hidden transition-all duration-300 h-5 flex items-center">
                        <span className="transform translate-x-2">→</span>
                      </span>
                      <span className="group-hover:border-b group-hover:border-primary pb-1 transition-all duration-300">
                        {link.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Let Us Help You */}
          <Card className={`border-0 shadow-none bg-transparent transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardContent className="p-0 space-y-6">
              <div className="relative inline-block">
                <h3 className="text-xl font-bold tracking-tight">{t('Footer.Let Us Help You')}</h3>
                <div className={`absolute h-1 w-0 bg-primary bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`} />
              </div>
              <ul className="space-y-3">
                {[
                  { href: '/page/shipping', text: t('Footer.Shipping Rates & Policies') },
                  { href: '/page/returns-policy', text: t('Footer.Returns & Replacements') },
                  { href: '/page/help', text: t('Footer.Help') }
                ].map((link, index) => (
                  <li key={index} className="overflow-hidden">
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <span className="w-0 group-hover:w-6 overflow-hidden transition-all duration-300 h-5 flex items-center">
                        <span className="transform translate-x-2">→</span>
                      </span>
                      <span className="group-hover:border-b group-hover:border-primary pb-1 transition-all duration-300">
                        {link.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Language and Currency Selection */}
        <div className={`mt-16 pt-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Separator className="mb-8" />
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 flex-wrap md:flex-nowrap">
              <Image
                src={site.logo}
                alt={`${site.name} logo`}
                width={48}
                height={48}
                className='w-14'
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
              <Select
                value={locale}
                onValueChange={(value) => {
                  router.push(pathname, { locale: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Footer.Select a language')} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <Link
                        className='w-full flex items-center gap-1'
                        href={pathname}
                        locale={lang.code}
                      >
                        <span className='text-lg'>{lang.icon}</span> {lang.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value)
                  window.scrollTo(0, 0)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Footer.Select a currency')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies
                    .filter((x) => x.code)
                    .map((currency, index) => (
                      <SelectItem key={index} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Bottom Links and Copyright */}
        <div className={`mt-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href='/page/conditions-of-use' className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
              {t('Footer.Conditions of Use')}
            </Link>
            <Link href='/page/privacy-policy' className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
              {t('Footer.Privacy Notice')}
            </Link>
            <Link href='/page/help' className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
              {t('Footer.Help')}
            </Link>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">© {site.copyright}</p>
            <p className="text-sm text-muted-foreground">{site.address} | {site.phone}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
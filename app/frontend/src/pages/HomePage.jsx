import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, ShieldCheck, Zap, Download, Database, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import { useI18n } from '../context/I18nContext';
import { api } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { DownloadLauncherButton } from '../components/DownloadLauncherButton';
import { SectionHeading } from '../components/SectionHeading';
import { FadeIn } from '../components/Reveal';

function LetterByLetter({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}

function EcosystemProductCard({ product, status, statusColor, action }) {
  const statusColors = {
    green: 'bg-green-500/10 text-green-500 border-green-500/30',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  return (
    <motion.div
      className='group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className='absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent' />
      <div className='relative p-6 flex flex-col h-full'>
        <div className='flex items-center gap-2 mb-4'>
          <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ' + (statusColors[statusColor] || statusColors.green)}>
            {status}
          </span>
        </div>
        <h3 className='font-display text-xl font-bold tracking-tight mb-2'>{product.title}</h3>
        <p className='text-sm text-muted-foreground flex-1 mb-6'>{product.description}</p>
        <div className='mt-auto pt-4 border-t border-border/50'>
          {action}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const featured = products.filter((product) => product.featured).slice(0, 3);

  const features = [
    {
      icon: Zap,
      title: t('home.features.fast.title', 'Rpido'),
      text: t(
        'home.features.fast.description',
        'Ferramentas focadas em fluxo de trabalho.'
      ),
    },
    {
      icon: ShieldCheck,
      title: t('home.features.licensed.title', 'Licenciado'),
      text: t(
        'home.features.licensed.description',
        'Entrega e gerenciamento de licenas.'
      ),
    },
    {
      icon: Code2,
      title: t('home.features.professional.title', 'Profissional'),
      text: t(
        'home.features.professional.description',
        'Software desenvolvido para produo real.'
      ),
    },
  ];

  return (
    <main className='min-h-screen'>
      <section className='mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8' id='home'>
        <div className='max-w-4xl'>
          <motion.p
            className='font-mono text-xs uppercase tracking-[0.25em] text-primary'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            GECKO LABS // SOFTWARE
          </motion.p>

          <motion.h1
            className='mt-5 text-5xl font-bold tracking-tight sm:text-7xl'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LetterByLetter text={t('home.hero.title', 'Software construdo para criar mais.')} />
          </motion.h1>

          <motion.p
            className='mt-6 max-w-2xl text-lg text-muted-foreground'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t(
              'home.hero.description',
              'Ferramentas profissionais, licenas digitais e produtos desenvolvidos pela Gecko Labs.'
            )}
          </motion.p>

          <motion.div
            className='mt-8 flex flex-wrap gap-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              to='/products'
              className='inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground'
            >
              {t('home.hero.productsButton', 'Ver softwares')}
              <ArrowRight className='h-4 w-4' />
            </Link>

            <DownloadLauncherButton variant='primary' />

            <Link
              to='/support'
              className='rounded-md border px-5 py-3 text-sm font-medium'
            >
              {t('home.hero.supportButton', 'Suporte')}
            </Link>
          </motion.div>
        </div>

        <div className='mt-20 grid gap-4 md:grid-cols-3'>
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className='rounded-xl border p-6'>
              <Icon className='h-5 w-5 text-primary' />
              <h2 className='mt-4 font-semibold'>{title}</h2>
              <p className='mt-2 text-sm text-muted-foreground'>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8'>
          <div className='mb-8 flex items-end justify-between'>
            <div>
              <p className='font-mono text-xs text-primary'>
                {t('home.featured.eyebrow', 'CATLOGO')}
              </p>

              <h2 className='mt-2 text-3xl font-bold'>
                {t('home.featured.title', 'Produtos em destaque')}
              </h2>
            </div>

            <Link to='/products' className='text-sm text-primary'>
              {t('home.featured.viewAll', 'Ver todos')}
            </Link>
          </div>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {featured.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Ecossistema Section */}
      <section
        id='ecossistema'
        className='mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8'
        aria-labelledby='ecosystem-heading'
      >
        <FadeIn>
          <SectionHeading
            chapter='03'
            title={t('home.ecosystem.title', 'Ecossistema Gecko Labs')}
            description={t('home.ecosystem.subtitle', 'Um ecossistema de ferramentas que trabalham em conjunto para conectar avaliao, organizao de informaes e elaborao de laudos.')}
            align='center'
          />
        </FadeIn>

        {/* Product Cards */}
        <FadeIn delay={0.1}>
          <div className='mt-12 grid gap-6 md:grid-cols-3'>
            <EcosystemProductCard
              product={t('home.ecosystem.laudia')}
              status={t('home.ecosystem.laudia.status', 'Disponvel')}
              statusColor='green'
              action={
                <Link
                  to='/products/ldia'
                  className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90'
                >
                  <ArrowRight className='h-4 w-4' />
                  {t('common.viewMore', 'Ver mais')}
                </Link>
              }
            />
            <EcosystemProductCard
              product={t('home.ecosystem.geckolauncher')}
              status={t('home.ecosystem.geckolauncher.status', 'Disponvel')}
              statusColor='green'
              action={
                <DownloadLauncherButton variant='primary' showInfo />
              }
            />
            <EcosystemProductCard
              product={t('home.ecosystem.instrumentia')}
              status={t('home.ecosystem.instrumentia.status', 'Em breve')}
              statusColor='amber'
              action={
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50'
                  disabled
                >
                  <span className='inline-flex items-center gap-1.5'>
                    <svg className='h-3.5 w-3.5 animate-spin' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' fill='none' /><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' /></svg>
                    Aguardando lanamento
                  </span>
                </button>
              }
            />
          </div>
        </FadeIn>

        {/* Integration Flow */}
        <FadeIn delay={0.2}>
          <div className='mt-16'>
            <div className='text-center mb-12'>
              <h3 className='font-mono text-xs uppercase tracking-[0.25em] text-primary'>{t('home.ecosystem.integrationTitle', 'Integrao planejada')}</h3>
              <p className='mt-2 max-w-2xl mx-auto text-sm text-muted-foreground'>{t('home.ecosystem.integrationDescription', 'O Instrument.IA est em desenvolvimento. A integrao com o LaudIA permitir que resultados de instrumentos psicolgicos sejam usados como contexto auxiliar na elaborao de laudos, mantendo fontes e resultados identificveis.')}</p>
            </div>
            <div className='relative'>
              <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2 hidden md:block' />
              <div className='space-y-8'>
                {t('home.ecosystem.integrationFlow', [
                  { step: 1, title: 'Selecionar instrumento', desc: 'Profissional seleciona e aplica instrumento compatvel no Instrument.IA' },
                  { step: 2, title: 'Organizar resultados', desc: 'Resultados so organizados e apresentados com contexto' },
                  { step: 3, title: 'Enviar ao LaudIA', desc: 'Com autorizao, dados pertinentes so enviados ao LaudIA como contexto auxiliar' },
                  { step: 4, title: 'Elaborar laudo', desc: 'LaudIA usa informaes como auxlio, mantendo fontes identificveis' },
                  { step: 5, title: 'Revisar e validar', desc: 'Profissional revisa e valida o contedo final' },
                ]).map((flow, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <div className='relative flex items-start gap-6 md:grid md:grid-cols-[1fr_48px_1fr] md:items-center'>
                      <div className={'md:' + (index % 2 === 0 ? 'text-right pr-8' : 'order-3 pl-8')}>
                        <div className={'inline-flex flex-col items-' + (index % 2 === 0 ? 'end' : 'start') + ' gap-2'}>
                          <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary'>
                            <span className='h-2 w-2 rounded-full bg-primary' />
                            <span>{t('common.step', 'Passo')} {index + 1}</span>
                          </span>
                          <h4 className='font-display text-lg font-bold'>{flow.title}</h4>
                          <p className='text-sm text-muted-foreground max-w-xs'>{flow.desc}</p>
                        </div>
                      </div>
                      <div className='hidden md:flex md:flex-col md:items-center md:justify-center'>
                        <div className='flex flex-col items-center gap-1'>
                          <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                          <div className='w-0.5 h-16 bg-border/50' />
                        </div>
                      </div>
                      <div className={'md:' + (index % 2 === 0 ? 'order-3 pl-8' : 'text-right pr-8')}>
                        <div className={'inline-flex flex-col items-' + (index % 2 === 0 ? 'end' : 'start') + ' gap-2'}>
                          <div className='rounded-xl bg-card border border-border/70 p-6 md:w-64'>
                            {index === 0 && (
                              <>
                                <Code2 className='h-8 w-8 text-primary mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground text-center'>Instrument.IA</p>
                              </>
                            )}
                            {index === 1 && (
                              <>
                                <Database className='h-8 w-8 text-primary mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground text-center'>Dados Organizados</p>
                              </>
                            )}
                            {index === 2 && (
                              <>
                                <ArrowRight className='h-8 w-8 text-primary mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground text-center'>Envio Seguro</p>
                              </>
                            )}
                            {index === 3 && (
                              <>
                                <FileText className='h-8 w-8 text-primary mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground text-center'>LaudIA</p>
                              </>
                            )}
                            {index === 4 && (
                              <>
                                <ShieldCheck className='h-8 w-8 text-primary mx-auto mb-2' />
                                <p className='text-sm text-muted-foreground text-center'>Validao Profissional</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
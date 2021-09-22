import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import Head from 'next/head'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Prismic from "@prismicio/client"
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps){
  // const totalWords = post.data.content.reduce((total, item) => {
  //   total += item.heading.split(' ').length
    
  //   const words = item.body.map(thisItem => thisItem.text.split(' ').length)
  //   words.map(word => (total += word))
  //   return total
  // }, 0)
  // const readTime = Math.ceil(totalWords / 200)
  
  const router = useRouter()
  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }
  
  return (
    <>
    
    <Head>
      <title>{post.data.title} | Axie news</title>
    </Head>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={`${commonStyles.container} ${styles.text}`}>
        <h2>{post.data.title}</h2>
        <div className={styles.details}>
          <FiCalendar/>
          <span>
          {format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        )}
          </span>
          <FiUser/>
          <span>
           
            {post.data.author}
          </span>
          <FiClock/>
          <span>
            
            {`4 min`}
          </span>
          
        </div>
        <h3>{post.data.subtitle}</h3>
        
        {post.data.content.map(content => {
          return (
            <article className={styles.article}key={content.heading}>
              <h2 className={styles.mainTitle}>{content.heading}</h2>
              <div className={styles.text}
              dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}
              />
            </article>
          )
        })}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);
  
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })
  
  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const {slug} = context.params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    },
  }
  
  return {
    props: {
      post
    }
  }
}


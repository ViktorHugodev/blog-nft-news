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
import Comments from '../../components/Comments';
import Link from 'next/link'
interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null
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
  nextPost: {
    uid: string;
    data: {
      title:string
    }
  }[]
  prevPost: {
    uid: string;
    data: {
      title:string
    }
  }[]
  post: Post;
  preview: boolean;

}

export default function Post({post, preview, prevPost, nextPost}: PostProps): JSX.Element{
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
        <div className={styles.navigationBox}>
          
          {prevPost[0]?.uid && (<div className={styles.prevBox}>
            <h3>{prevPost[0]?.data.title.slice(0, 30)}</h3>
            <Link href={`${prevPost[0]?.uid}`}>
              <a>
                Post anterior
              </a>
            </Link>
          </div>)}
          
          {nextPost[0]?.uid && (<div className={styles.nextBox}>
            <h3>{nextPost[0]?.data.title}</h3>
            <Link href={`${nextPost[0]?.uid}`}>
              <a className={styles.aLeft}>
                Próximo post
              </a>
            </Link>
          </div>)}
          
          
        </div>
        <Comments/>
      {preview && (
			<aside className={styles.buttonExit}>
				<Link href="/api/exit-preview">
			    <a>Sair do modo Preview</a>
				</Link>
      </aside>
      )}
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

export const getStaticProps: GetStaticProps = async({ 
  params,
  preview = false,
  previewData
}) => {
  const {slug} = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
    
  });
  
  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );
  
  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  )
  
  
  const post = {
    uid: response.uid,
    last_publication_date: response.last_publication_date,
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
  console.log(prevPost)
  return {
    props: {
      post,
      preview,
      nextPost: nextPost?.results,
      prevPost: prevPost?.results,
    }
  }
}


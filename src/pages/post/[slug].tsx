import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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
  return (
    <>
    <Head>
      <title>Posts | Axie news</title>
    </Head>
      <div className={styles.banner}>
        <img src="/images/Banner.svg" alt="banner" />
      </div>
      <main className={`${commonStyles.container} ${styles.text}`}>
        <h2>Titulo de teste</h2>
        <div className={styles.details}>
          <FiCalendar/>
          <span>
          15 Mar 2021
          </span>
          <FiUser/>
          <span>
           
            Victor Hugo
          </span>
          <FiClock/>
          <span>
            
            4 min
          </span>
          
        </div>
        <h3>Subtitulo de testes</h3>
        <p>Lorem ipsum dolor sit <strong>amet consectetur adipisicing elit</strong>. Ipsa tempora asperiores magni obcaecati consectetur quisquam repellat deleniti reprehenderit perferendis odio! Neque, repellat hic fugiat <a href="">quaerat iure aliquid rerum</a> mollitia accusamus.</p>
        
        <article>
          
        </article>
      </main>
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query();

//   // TODO
// };

// export const getStaticProps = async context => {
//   const {slug} = context
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID('posts', String(slug), {});
//   console.log(response)
//   // const post = {
//   //   first_publication_date: response.first_publication_date,
    
//   // }
// };
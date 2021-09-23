
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Prismic from '@prismicio/client';
import React, { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string 
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination
  preview: boolean  
}

export default function Home({postsPagination, preview }: HomeProps){
  const formattedDate = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR
        }
      )
    }
  })
  const [posts, setPosts] = useState<Post[]>(formattedDate)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)
  
  async function handleNextPage(){
    if (currentPage !== 1 && nextPage === null){
      return
    }
    
    const postsResults = await fetch(`${nextPage}`).then(response => response.json())
    setNextPage(postsResults.next_page)
    setCurrentPage(postsResults.page)
    
    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }
    
  
  
  return (
    <>
      <Head>
        <title>Início | Axie news</title>
      </Head>
      <main className={`${commonStyles.container}`}>
        <div className={styles.posts}>
         {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <h1 className={styles.title}>{post.data.title}</h1>
              <p>
                {post.data.subtitle}
              </p>
              <div className={styles.autor}>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </a>
          </Link>
         ))}
      
          {nextPage && (
            <button 
            onClick={handleNextPage}
            type="button">Carregar mais posts</button>
          )}
        </div>
        {preview && (
			  <aside className={styles.buttonExit}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      ref: previewData?.ref ?? null

    },
    
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
 
  
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }
  
  return {
    props: {
      postsPagination,
      preview

    },
  };
};

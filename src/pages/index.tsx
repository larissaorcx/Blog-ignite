import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [loadMorePost, setLoadMorePost] = useState<Post[]>(
    postsPagination.results
  );

  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function loadMorePostsButton(): Promise<void> {
    const load = await fetch(nextPage).then(response => response.json());

    setLoadMorePost([...loadMorePost, ...load.results]);
    setNextPage(load.next_page);
  }
  return (
    <>
      <Header />
      <main>
        <div className={styles.content}>
          {loadMorePost?.map(post => (
            <Link href={`/postuid/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <h3>{post.data.subtitle}</h3>
                <div className={styles.gridContainer}>
                  <FiCalendar className={styles.iconCalendar} />
                  <time>
                    {format(new Date(post?.first_publication_date), 'PP', {
                      locale: ptBR,
                    })}
                  </time>
                  <FiUser className={styles.iconruser} />
                  <p>{post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button
            type="button"
            className={styles.button}
            onClick={loadMorePostsButton}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  const results = postsResponse.results.map(post => {
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

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};

import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
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
  return (
    <>
      <Header />
      <main>
        <div className={styles.content}>
          {postsPagination.results.map(post => (
            <Link href={`/postuid/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>{post.first_publication_date}</time>
                <p>{post.data.author}</p>
              </a>
            </Link>
          ))}
        </div>
        {postsPagination.next_page === null ? null : (
          <button type="button">Carregar mais posts</button>
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
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
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

import { GetStaticPaths, GetStaticProps } from 'next';
// eslint-disable-next-line no-use-before-define
import React from 'react';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
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

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const readingTime = Math.ceil(
    post?.data?.content?.reduce((previous, current) => {
      const headingNumberOfWords = current.heading.split(' ').length;
      const bodyNumberOfWords = RichText.asText(current.body)
        .replace(/\n\n|\r?\n|\r/g, ' ')
        .split(' ').length;

      return previous + (headingNumberOfWords + bodyNumberOfWords) / 200;
    }, 0)
  );

  if (router.isFallback) {
    return <div className={styles.load}> Carregando...</div>;
  }
  return (
    <>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="Banner" />
      <div className={styles.content}>
        <strong className={styles.title}>{post.data.title}</strong>
        <div className={styles.gridContainer}>
          <FiCalendar className={styles.iconCalendar} />
          <time className={styles.time}>
            {format(new Date(post?.first_publication_date), 'PP', {
              locale: ptBR,
            })}
          </time>
          <FiUser className={styles.iconruser} />
          <p className={styles.author}>{post.data.author}</p>
          <FiClock />
          <p>{readingTime} min</p>
        </div>
        <div>
          {post.data.content.map(content => (
            <>
              <h3 key={content.heading} className={styles.subTitle}>
                {content.heading}
              </h3>
              <div
                className={styles.subContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

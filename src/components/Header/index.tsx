import Img from 'next/image';
import Link from 'next/link';
import style from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <div className={style.Logo}>
        <Img src="/Logo.svg" alt="logo" width={250} height={155} />
      </div>
    </Link>
  );
}

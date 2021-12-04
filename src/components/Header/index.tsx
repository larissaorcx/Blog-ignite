import Img from 'next/image';
import style from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <a className={style.Logo} href="/">
      <Img src="/Logo.svg" alt="Logo" width={250} height={155} />
    </a>
  );
}

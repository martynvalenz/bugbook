import Link from "next/link";
import { type ReactNode } from "react";
import {LinkItUrl,LinkIt} from 'react-linkify-it'

interface LinkifyProps {
  children:ReactNode
}

export const Linkify = ({children}:LinkifyProps) => {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>
          {children}
        </LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  )
}

const LinkifyUrl = ({children}:LinkifyProps) => {
  return (
    <LinkItUrl className="text-primary hover:underline">
      {children}
    </LinkItUrl>
  )
}

const LinkifyUsername = ({children}:LinkifyProps) => {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match,key) => {
        return (
          <Link href={`/users/${match.slice(1)}`} className="text-primary hover:underline" key={key}>
            {match}
          </Link>
        )
      }}
    >
      {children}
    </LinkIt>
  )
}

const LinkifyHashtag = ({children}:LinkifyProps) => {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_-]+)/}
      component={(match,key) => {
        return (
          <Link href={`/hashtag/${match.slice(1)}`} className="text-primary hover:underline" key={key}>
            {match}
          </Link>
        )
      }}
    >
      {children}
    </LinkIt>
  )
}
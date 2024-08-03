import { validateRequest } from "@/auth"
import prisma from "@/lib/prisma"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { Button } from "./ui/button"
import UserAvatar from "./UserAvatar"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { formatNumber } from "@/lib/utils"
import FollowButton from "./FollowButton"
import { getUserDataSelect } from "@/lib/types"
import UserTooltip from "./UserTooltip"

const TrendsSidebar = () => {
  return (
    <div className='sticky top-[5.25rem] hidden md:block lg:w-80 w-72 h-fit flex-none space-y-5'>
      <Suspense
        fallback={<Loader2 className="mx-auto animate-spin" />}
      >
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  )
}

export default TrendsSidebar

const WhoToFollow = async() => {
  const {user} = await validateRequest()
  if(!user) return null

  const userstoFollow = await prisma.user.findMany({
    where:{
      NOT:{
        id:user.id
      },
      fallowers:{
        none:{
          followerId:user.id
        }
      }
    },
    select:getUserDataSelect(user.id),
    take:5
  })

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">
        Who to follow
      </div>
      {userstoFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user}>
            <Link href={`/users/${user.username}`} className="flex items-center gap-3">
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 text-ellipsis break-all font-semibold hover:underline">{user.displayName}</p>
                <p className="line-clamp-1 break-all text-muted-foreground">@{user.username}</p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton userId={user.id} initialState={{ 
            followers: user._count.fallowers,
            isFollowedByUser:user.fallowers.some(
              ({followerId})  => followerId === user.id
            ),
          }} />
        </div>
      ))}
    </div>
  ) 
}

const getTrendingTopics = unstable_cache(
  async() => {
    const result = await prisma.$queryRaw<{hashtag:string, count:bigint}[]>`
      SELECT LOWER(unnest(regexp_matches(content,'#[[:alnum:]_]+','g'))) AS hashtag, COUNT(*) as count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

    return result.map(row => ({
      hashtag:row.hashtag,
      count:Number(row.count)
    }))
  },
  ["trending_topics"],
  {
    revalidate:3 * 60 * 60,
  }
)

const TrendingTopics = async() => {
  const trendingTopics = await getTrendingTopics()

  return (
    <div className="space-y-5 rounded-2xl p-5 shadow-sm bg-card">
      <div className="text-xl font-bold">
        Trending topics
      </div>
      {
        trendingTopics.map(({hashtag,count}) => {
          const title = hashtag.split('#')[1]

          return (
            <Link key={title} href={`/hashtag/${title}`} className="block">
              <p className="line-clamp-1 break-all font-semibold hover:underline" title={hashtag}>
                {hashtag}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(count)} {count === 1 ? 'post' : 'posts'}
              </p>
            </Link>
          )
        })
      }
    </div>
  )
}
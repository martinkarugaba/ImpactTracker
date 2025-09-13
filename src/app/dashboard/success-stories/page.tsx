import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconUser,
  IconCalendar,
  IconMapPin,
  IconArrowRight,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { auth } from "@/features/auth/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Inspiring stories from our community members and partners.",
};

// Mock data for placeholder content
const mockSuccessStories = [
  {
    id: 1,
    title: "Empowering Women Farmers in Kampala",
    excerpt:
      "How a group of 25 women transformed their agricultural practices and increased yields by 200%.",
    author: "Sarah Nakato",
    location: "Kampala District",
    date: "2024-08-15",
    category: "Agriculture",
    impact: "25 women beneficiaries",
    featured: true,
  },
  {
    id: 2,
    title: "Youth Enterprise Development Success",
    excerpt:
      "Young entrepreneurs create sustainable businesses through our training and support programs.",
    author: "John Kigozi",
    location: "Mbale District",
    date: "2024-07-22",
    category: "Youth Development",
    impact: "15 businesses created",
    featured: false,
  },
  {
    id: 3,
    title: "Financial Literacy Transforms Communities",
    excerpt:
      "VSLA groups achieve remarkable savings growth and financial independence.",
    author: "Grace Nambi",
    location: "Gulu District",
    date: "2024-06-10",
    category: "Financial Inclusion",
    impact: "500+ participants",
    featured: true,
  },
  {
    id: 4,
    title: "Digital Skills for Rural Development",
    excerpt:
      "Technology training bridges the digital divide in remote communities.",
    author: "Moses Okello",
    location: "Arua District",
    date: "2024-05-18",
    category: "Digital Literacy",
    impact: "200 trainees",
    featured: false,
  },
];

const impactMetrics = [
  {
    title: "Lives Impacted",
    value: "2,500+",
    description: "Community members directly benefited",
    icon: IconUser,
  },
  {
    title: "Success Rate",
    value: "85%",
    description: "Programs achieving target outcomes",
    icon: IconTrendingUp,
  },
  {
    title: "Communities Reached",
    value: "45",
    description: "Districts and subcounties covered",
    icon: IconMapPin,
  },
  {
    title: "Stories Documented",
    value: "156",
    description: "Success stories collected",
    icon: IconStar,
  },
];

export default async function SuccessStoriesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Restrict to super admin only
  if (session.user.role !== "super_admin") {
    redirect("/dashboard");
  }

  const featuredStories = mockSuccessStories.filter(story => story.featured);
  const regularStories = mockSuccessStories.filter(story => !story.featured);

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Success Stories
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover inspiring stories of transformation and impact from our
              community programs.
            </p>
          </div>
          <Button className="shrink-0">
            <IconArrowRight className="mr-2 h-4 w-4" />
            Share Your Story
          </Button>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {impactMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <metric.icon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm font-medium">{metric.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {metric.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <IconStar className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Featured Stories</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {featuredStories.map(story => (
              <Card key={story.id} className="border-l-primary border-l-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="mb-2">
                      {story.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <CardDescription className="text-base">
                    {story.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <IconUser className="h-4 w-4" />
                        <span>{story.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IconMapPin className="h-4 w-4" />
                        <span>{story.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IconCalendar className="h-4 w-4" />
                      <span>{new Date(story.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary text-sm font-medium">
                      Impact: {story.impact}
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Stories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">All Success Stories</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {regularStories.map(story => (
            <Card key={story.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">
                  {story.category}
                </Badge>
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <CardDescription>{story.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground space-y-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <IconUser className="h-4 w-4" />
                    <span>{story.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconMapPin className="h-4 w-4" />
                    <span>{story.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconCalendar className="h-4 w-4" />
                    <span>{new Date(story.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-primary text-sm font-medium">
                    {story.impact}
                  </div>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-4 p-8 text-center">
          <h3 className="text-2xl font-semibold">
            Have a Success Story to Share?
          </h3>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            We love hearing about the positive impact our programs have on
            communities. Share your story and inspire others to take action.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button>Submit Your Story</Button>
            <Button variant="outline">Contact Us</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

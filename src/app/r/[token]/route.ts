import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const request = await prisma.reviewRequest.findUnique({
    where: { trackingToken: token },
    include: { client: { select: { googleReviewLink: true } } },
  });

  if (!request || !request.client.googleReviewLink) {
    return NextResponse.redirect("https://bizautomatrix.com");
  }

  // Mark as clicked (only first time)
  if (request.status === "SENT") {
    await prisma.reviewRequest.update({
      where: { id: request.id },
      data: { status: "CLICKED", clickedAt: new Date() },
    });
  }

  return NextResponse.redirect(request.client.googleReviewLink);
}

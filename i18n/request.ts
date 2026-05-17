import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const acceptLanguage = headersList.get("accept-language");

  let locale = "fr";

  if (localeCookie && ["fr", "en"].includes(localeCookie)) {
    locale = localeCookie;
  } else if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
    if (preferred && ["fr", "en"].includes(preferred)) {
      locale = preferred;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

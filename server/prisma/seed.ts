import { PrismaClient, Role, ListingStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	await prisma.listingImage.deleteMany()
	await prisma.listing.deleteMany()
	await prisma.comment.deleteMany()
	await prisma.post.deleteMany()
	await prisma.forum.deleteMany()
	await prisma.event.deleteMany()
	await prisma.announcement.deleteMany()
	await prisma.user.deleteMany()
	await prisma.neighborhood.deleteMany()

	const n1 = await prisma.neighborhood.create({ data: { name: 'Jeżyce' } })
	const n2 = await prisma.neighborhood.create({ data: { name: 'Wilda' } })
	const n3 = await prisma.neighborhood.create({ data: { name: 'Grunwald' } })
	const n4 = await prisma.neighborhood.create({ data: { name: 'Rataje' } })
	const n5 = await prisma.neighborhood.create({ data: { name: 'Stare Miasto' } })

	const u1 = await prisma.user.create({
		data: {
			firstName: 'Marta',
			lastName: 'Nowak',
			email: 'marta.nowak@example.com',
			password: 'secure_password_1',
			role: Role.ADMIN,
			neighborhoodId: n1.id,
			photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u2 = await prisma.user.create({
		data: {
			firstName: 'Tomasz',
			lastName: 'Kowalski',
			email: 'tomasz.kowalski@example.com',
			password: 'secure_password_2',
			role: Role.COUNCILLOR,
			neighborhoodId: n1.id,
			photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u3 = await prisma.user.create({
		data: {
			firstName: 'Agnieszka',
			lastName: 'Wiśniewska',
			email: 'agnieszka.w@example.com',
			password: 'secure_password_3',
			role: Role.USER,
			neighborhoodId: n2.id,
			photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u4 = await prisma.user.create({
		data: {
			firstName: 'Piotr',
			lastName: 'Zalewski',
			email: 'piotr.z@example.com',
			password: 'secure_password_4',
			role: Role.USER,
			neighborhoodId: n2.id,
			photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u5 = await prisma.user.create({
		data: {
			firstName: 'Katarzyna',
			lastName: 'Wójcik',
			email: 'kasia.wojcik@example.com',
			password: 'secure_password_5',
			role: Role.USER,
			neighborhoodId: n3.id,
			photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u6 = await prisma.user.create({
		data: {
			firstName: 'Michał',
			lastName: 'Kamiński',
			email: 'michal.k@example.com',
			password: 'secure_password_6',
			role: Role.USER,
			neighborhoodId: n3.id,
			photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u7 = await prisma.user.create({
		data: {
			firstName: 'Karolina',
			lastName: 'Lewandowska',
			email: 'karolina.l@example.com',
			password: 'secure_password_7',
			role: Role.COUNCILLOR,
			neighborhoodId: n4.id,
			photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u8 = await prisma.user.create({
		data: {
			firstName: 'Jan',
			lastName: 'Zieliński',
			email: 'jan.zielinski@example.com',
			password: 'secure_password_8',
			role: Role.USER,
			neighborhoodId: n4.id,
			photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u9 = await prisma.user.create({
		data: {
			firstName: 'Paweł',
			lastName: 'Szymański',
			email: 'pawel.sz@example.com',
			password: 'secure_password_9',
			role: Role.USER,
			neighborhoodId: n5.id,
			photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
		},
	})
	const u10 = await prisma.user.create({
		data: {
			firstName: 'Barbara',
			lastName: 'Mazur',
			email: 'basia.mazur@example.com',
			password: 'secure_password_10',
			role: Role.USER,
			neighborhoodId: n5.id,
			photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=250&q=80',
		},
	})

	const e1 = await prisma.event.create({
		data: {
			name: 'Kino Plenerowe nad Wartą',
			description: 'Wspólny pokaz filmowy pod gołym niebem. Zabierzcie koce i dobry humor!',
			place: 'KontenerART, ul. Ewangelicka 1, 61-855 Poznań',
			date: new Date('2026-06-15T20:00:00Z'),
			duration: '3 GODZ.',
			price: 0.0,
			image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
			authorId: u9.id,
			neighborhoodId: n5.id,
			attendees: { connect: [{ id: u1.id }, { id: u3.id }, { id: u10.id }] },
		},
	})
	const e2 = await prisma.event.create({
		data: {
			name: 'Sąsiedzki Targ Śniadaniowy',
			description: 'Lokalni wystawcy, pyszne jedzenie, świeża kawa i rzemieślnicze wypieki.',
			place: 'Park Sołacki, ul. Litewska, 60-605 Poznań',
			date: new Date('2026-06-21T09:00:00Z'),
			duration: '5 GODZ.',
			price: 0.0,
			image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80',
			authorId: u2.id,
			neighborhoodId: n1.id,
			attendees: { connect: [{ id: u5.id }, { id: u6.id }] },
		},
	})
	const e3 = await prisma.event.create({
		data: {
			name: 'Warsztaty Jogi na Trawie',
			description:
				'Poranny rozruch dla każdego, niezależnie od poziomu zaawansowania. Weź matę.',
			place: 'Park Cytadela, al. Armii Poznań, 61-712 Poznań',
			date: new Date('2026-07-05T08:30:00Z'),
			duration: '1.5 GODZ.',
			price: 15.0,
			image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
			authorId: u1.id,
			neighborhoodId: n1.id,
			attendees: { connect: [{ id: u2.id }, { id: u3.id }, { id: u7.id }] },
		},
	})
	const e4 = await prisma.event.create({
		data: {
			name: 'Bieg dookoła Malty',
			description: 'Amatorskie zawody biegowe z nagrodami ufundowanymi przez radę osiedla.',
			place: 'Tor Regatowy Malta, ul. Wiankowa 3, 61-131 Poznań',
			date: new Date('2026-06-28T10:00:00Z'),
			duration: '2 GODZ.',
			price: 10.0,
			image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=800&q=80',
			authorId: u7.id,
			neighborhoodId: n4.id,
			attendees: { connect: [{ id: u8.id }, { id: u4.id }] },
		},
	})
	const e5 = await prisma.event.create({
		data: {
			name: 'Wymiana Książkowa',
			description:
				'Przynieś książki, które już przeczytałeś, i zabierz do domu nowe perełki.',
			place: 'Biblioteka Raczyńskich Filia 2, ul. Masztalarska 8, 61-767 Poznań',
			date: new Date('2026-06-12T17:00:00Z'),
			duration: '4 GODZ.',
			price: 0.0,
			image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
			authorId: u10.id,
			neighborhoodId: n5.id,
			attendees: { connect: [{ id: u9.id }, { id: u1.id }, { id: u5.id }] },
		},
	})
	const e6 = await prisma.event.create({
		data: {
			name: 'Zbiórka Elektrośmieci i Gabarytów',
			description: 'Bezpieczna i ekologiczna utylizacja starego sprzętu AGD i RTV.',
			place: 'Hala Arena, ul. Wyspiańskiego 33, 60-751 Poznań',
			date: new Date('2026-06-20T08:00:00Z'),
			duration: '6 GODZ.',
			price: 0.0,
			image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
			authorId: u5.id,
			neighborhoodId: n3.id,
			attendees: { connect: [{ id: u6.id }] },
		},
	})
	const e8 = await prisma.event.create({
		data: {
			name: 'Zwiedzanie Palmiarni',
			description: 'Egzotyczna podróż śladami roślinności tropikalnej w sercu Poznania.',
			place: 'Palmiarnia Poznańska, ul. Matejki 18, 60-767 Poznań',
			date: new Date('2026-06-02T11:00:00Z'),
			duration: '1.5 GODZ.',
			price: 20.0,
			image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
			authorId: u6.id,
			neighborhoodId: n3.id,
			attendees: { connect: [{ id: u5.id }, { id: u2.id }] },
		},
	})
	const e9 = await prisma.event.create({
		data: {
			name: 'Wielkie Grillowanie Mieszkańców',
			description: 'Integracja sąsiedzka przy wspólnym ruszcie. Smażymy roślinnie i mięsnie.',
			place: 'Park Kasprowicza, ul. Reymonta, 60-791 Poznań',
			date: new Date('2026-07-11T16:00:00Z'),
			duration: '5 GODZ.',
			price: 0.0,
			image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
			authorId: u4.id,
			neighborhoodId: n2.id,
			attendees: { connect: [{ id: u3.id }, { id: u1.id }, { id: u6.id }] },
		},
	})
	const e10 = await prisma.event.create({
		data: {
			name: 'Koncert Muzyki Klasycznej',
			description: 'Wieczorny recital fortepianowy wybitnych studentów Akademii Muzycznej.',
			place: 'Aula Nova, pl. Stefana Stuligrosza 1, 61-874 Poznań',
			date: new Date('2026-06-19T19:00:00Z'),
			duration: '2 GODZ.',
			price: 25.0,
			image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80',
			authorId: u1.id,
			neighborhoodId: n5.id,
			attendees: { connect: [{ id: u10.id }, { id: u9.id }] },
		},
	})

	const f1 = await prisma.forum.create({
		data: {
			name: 'Zieleń i ekologia',
			description: 'Dbamy o czystość i roślinność w naszej okolicy',
			icon: '🌱',
			neighborhoodId: n1.id,
		},
	})
	const f2 = await prisma.forum.create({
		data: {
			name: 'Zaginione i znalezione pupile',
			description: 'Pomoc w odnajdywaniu zagubionych zwierząt',
			icon: '🐾',
			neighborhoodId: n1.id,
		},
	})
	const f3 = await prisma.forum.create({
		data: {
			name: 'Pomoc sąsiedzka',
			description: 'Pożycz wiertarkę, pomóż w zakupach',
			icon: '🤝',
			neighborhoodId: n2.id,
		},
	})
	const f4 = await prisma.forum.create({
		data: {
			name: 'Sprawy lokalne i infrastruktura',
			description: 'Drogi, chodniki, remonty i radni',
			icon: '🏗️',
			neighborhoodId: n3.id,
		},
	})
	const f5 = await prisma.forum.create({
		data: {
			name: 'Kultura i integracja',
			description: 'Co robimy w wolnym czasie na dzielnicy',
			icon: '🎭',
			neighborhoodId: n4.id,
		},
	})
	const f6 = await prisma.forum.create({
		data: {
			name: 'Bezpieczeństwo',
			description: 'Ostrzeżenia i zgłoszenia podejrzanych sytuacji',
			icon: '🚨',
			neighborhoodId: n5.id,
		},
	})

	const p1 = await prisma.post.create({
		data: {
			title: 'Dzikie wysypisko przy torach',
			content:
				'Ktoś wyrzucił stare opony i gruz w okolicy przejścia przez tory. Zgłaszam to do SM, ale uważajcie na spacerach.',
			authorId: u3.id,
			neighborhoodId: n2.id,
			forumId: f4.id,
		},
	})
	const p2 = await prisma.post.create({
		data: {
			title: 'Uciekł rudy kot - Jeżyce',
			content:
				'Wczoraj wieczorem z balkonu na parterze przy ul. Jackowskiego uciekł rudy, pręgowany kot. Reaguje na imię Rufus.',
			authorId: u1.id,
			neighborhoodId: n1.id,
			forumId: f2.id,
		},
	})
	const p3 = await prisma.post.create({
		data: {
			title: 'Szukam kogoś z wiertarką udarową',
			content:
				'Potrzebuję wywiercić dosłownie 3 otwory w żelbecie. Odwdzięczę się dobrym rzemieślniczym piwem!',
			authorId: u4.id,
			neighborhoodId: n2.id,
			forumId: f3.id,
		},
	})
	const p4 = await prisma.post.create({
		data: {
			title: 'Nasadzenia nowych drzew',
			content:
				'Świetna informacja! Rada Osiedla zatwierdziła projekt nasadzeń ponad 40 nowych platanów wzdłuż ulicy.',
			authorId: u2.id,
			neighborhoodId: n1.id,
			forumId: f1.id,
		},
	})
	const p5 = await prisma.post.create({
		data: {
			title: 'Hałas w nocy na Starym Rynku',
			content:
				'Czy tylko ja mam wrażenie, że od powrotu ogródków restauracyjnych poziom hałasu po godzinie 22 przekracza wszelkie normy?',
			authorId: u10.id,
			neighborhoodId: n5.id,
			forumId: f6.id,
		},
	})
	const p6 = await prisma.post.create({
		data: {
			title: 'Klub książki na Ratajach?',
			content:
				'Czy byliby chętni na regularne, comiesięczne spotkania przy kawie i dyskusje o literaturze współczesnej?',
			authorId: u8.id,
			neighborhoodId: n4.id,
			forumId: f5.id,
		},
	})
	const p7 = await prisma.post.create({
		data: {
			title: 'Podejrzany kręcący się typ',
			content:
				'Uwaga, od dwóch dni facet w czarnej kapuzie przygląda się zaparkowanym autom na Podgórnej i sprawdza klamki.',
			authorId: u9.id,
			neighborhoodId: n5.id,
			forumId: f6.id,
		},
	})
	const p8 = await prisma.post.create({
		data: {
			title: 'Wymiana sadzonek pomidorów',
			content:
				'Zostało mi kilkanaście ładnych flanców pomidorów malinowych. Ktoś chce się wymienić na zioła lub inne warzywa?',
			authorId: u5.id,
			neighborhoodId: n3.id,
			forumId: f1.id,
		},
	})
	const p9 = await prisma.post.create({
		data: {
			title: 'Zgubiony pęk kluczy z brelokiem LEGO',
			content:
				'Znaleziono klucze na placu zabaw przy ul. Marcelińskiej. Do odebrania u mnie.',
			authorId: u6.id,
			neighborhoodId: n3.id,
			forumId: f3.id,
		},
	})
	const p10 = await prisma.post.create({
		data: {
			title: 'Stan nawierzchni na Głogowskiej',
			content: 'Dziury po zimie wciąż nie zostały załatane. Można tam stracić zawieszenie.',
			authorId: u5.id,
			neighborhoodId: n3.id,
			forumId: f4.id,
		},
	})
	const p11 = await prisma.post.create({
		data: {
			title: 'Zajęcia plastyczne dla seniorów',
			content:
				'Ruszyły zapisy na bezpłatne zajęcia z akwareli w Domu Kultury. Może warto zapisać dziadków?',
			authorId: u7.id,
			neighborhoodId: n4.id,
			forumId: f5.id,
		},
	})
	const p12 = await prisma.post.create({
		data: {
			title: 'Znaleziono psa! Czarny labrador',
			content:
				'Biegał bez obroży w okolicach Malty. Jest bardzo przyjacielski, zabezpieczyłem go na moim ogrodzie.',
			authorId: u8.id,
			neighborhoodId: n4.id,
			forumId: f2.id,
		},
	})

	await prisma.comment.create({
		data: {
			content: 'Widziałem go dzisiaj rano przy Kraszewskiego, biegł w stronę rynku!',
			authorId: u2.id,
			postId: p2.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Dzięki Bogu, sprawdzę tamten rejon. Proszę o kontakt gdyby ktoś go widział.',
			authorId: u1.id,
			postId: p2.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Ja mam, chętnie pomogę. Napisz na priv, mieszkam blok obok.',
			authorId: u3.id,
			postId: p3.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Wspaniała inicjatywa, w końcu będzie trochę cienia latem.',
			authorId: u5.id,
			postId: p4.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'To jest dramat, nie da się spać przy otwartym oknie...',
			authorId: u9.id,
			postId: p5.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Mieszkasz w centrum miasta, urok tej lokalizacji. Kup sobie stopery.',
			authorId: u4.id,
			postId: p5.id,
		},
	})
	await prisma.comment.create({
		data: {
			content:
				'Super pomysł! Ja piszę się na 100%. Wolę literaturę faktu, ale chętnie poczytam Calcium.',
			authorId: u7.id,
			postId: p6.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Dzięki za ostrzeżenie, dzwonię na policję jeśli znowu go zobaczę.',
			authorId: u10.id,
			postId: p7.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Chętnie wezmę 3 sztuki! Mam na wymianę piękną miętę marokańską.',
			authorId: u6.id,
			postId: p8.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Ooo, to chyba klucze mojego syna! Napisałem wiadomość prywatną.',
			authorId: u4.id,
			postId: p9.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Zgadzam się, ostatnio omijam tę ulicę szerokim łukiem.',
			authorId: u6.id,
			postId: p10.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Moja babcia chodzi i jest zachwycona prowadzącą panią Anią!',
			authorId: u8.id,
			postId: p11.id,
		},
	})
	await prisma.comment.create({
		data: {
			content: 'Właściciel już się znalazł, pies wraca bezpiecznie do domu.',
			authorId: u8.id,
			postId: p12.id,
		},
	})

	await prisma.announcement.create({
		data: {
			title: 'Przerwa w dostawie wody',
			content:
				'W dniu 03.06.2026 od godziny 8:00 do 14:00 nastąpi przerwa w dostawie wody przy ul. Słowackiego.',
			authorId: u2.id,
			neighborhoodId: n1.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Modernizacja placu zabaw',
			content:
				'Informujemy, że od poniedziałku ruszają prace konserwacyjne na placu zabaw. Będzie zamknięty przez tydzień.',
			authorId: u7.id,
			neighborhoodId: n4.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Konsultacje społeczne',
			content:
				'Zapraszamy na spotkanie dotyczące nowego planu zagospodarowania przestrzennego dla rejonu Wildy.',
			authorId: u1.id,
			neighborhoodId: n2.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Zbiórka darów dla schroniska',
			content:
				'Zbieramy koce, karmę i zabawki dla psów i kotów. Kosz wystawiony w żabce na rogu.',
			authorId: u5.id,
			neighborhoodId: n3.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Czyszczenie elewacji bloków',
			content:
				'W dniach 10-12 czerwca firma alpinistyczna będzie myć elewacje frontowe. Prosimy zamknąć okna.',
			authorId: u2.id,
			neighborhoodId: n1.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Zmiana organizacji ruchu',
			content:
				'Uwaga, ulica Szyperska staje się drogą jednokierunkową od najbliższego piątku.',
			authorId: u1.id,
			neighborhoodId: n5.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Bezpłatne szczepienia przeciw grypie',
			content:
				'Dla mieszkańców 60+ przychodnia przy Marcelińskiej organizuje darmowe szczepienia.',
			authorId: u2.id,
			neighborhoodId: n3.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Darmowy przegląd rowerowy',
			content:
				'W sobotę na rynku Jeżyckim serwisanci będą bezpłatnie regulować hamulce i przerzutki.',
			authorId: u2.id,
			neighborhoodId: n1.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Naprawa oświetlenia ulicznego',
			content:
				'Awaria latarni na ul. Wierzbięcice została zgłoszona, naprawa nastąpi w przeciągu 48h.',
			authorId: u1.id,
			neighborhoodId: n2.id,
		},
	})
	await prisma.announcement.create({
		data: {
			title: 'Malowanie pasów na przejściach',
			content:
				'W nocy z wtorku na środę będą odnawiane pasy na przejściach dla pieszych na osiedlu Rusa.',
			authorId: u7.id,
			neighborhoodId: n4.id,
		},
	})

	const l1 = await prisma.listing.create({
		data: {
			title: 'Rower miejski Gazelle',
			description:
				'Sprzedam sprawny, holenderski rower miejski. 7 biegów w piaście, dynamo, wygodne siodło.',
			price: 850.0,
			contact: '601-234-567',
			status: ListingStatus.AVAILABLE,
			authorId: u3.id,
			neighborhoodId: n2.id,
		},
	})
	const l2 = await prisma.listing.create({
		data: {
			title: 'Narożnik z funkcją spania',
			description:
				'Szary narożnik, stan bardzo dobry, brak plam. Odbiór osobisty z windy towarowej.',
			price: 1200.0,
			contact: '502-345-678',
			status: ListingStatus.AVAILABLE,
			authorId: u4.id,
			neighborhoodId: n2.id,
		},
	})
	const l3 = await prisma.listing.create({
		data: {
			title: 'Klawiatura mechaniczna Keychron K2',
			description:
				'Przełączniki Gateron Brown, podświetlenie RGB. Mało używana, pełen komplet producenta.',
			price: 300.0,
			contact: '703-456-789',
			status: ListingStatus.AVAILABLE,
			authorId: u6.id,
			neighborhoodId: n3.id,
		},
	})
	const l5 = await prisma.listing.create({
		data: {
			title: 'Stół jadalniany IKEA Ingo',
			description: 'Lite drewno sosnowe, lekkie przetarcia. Idealny do małej kuchni.',
			price: 100.0,
			contact: '905-678-901',
			status: ListingStatus.RESERVED,
			authorId: u8.id,
			neighborhoodId: n4.id,
		},
	})
	const l6 = await prisma.listing.create({
		data: {
			title: 'Podręczniki do liceum klasa 2',
			description:
				'Zestaw książek do nowej podstawy programowej. Matematyka, Polski, Biologia.',
			price: 150.0,
			contact: '606-789-012',
			status: ListingStatus.SOLD,
			authorId: u1.id,
			neighborhoodId: n1.id,
		},
	})
	const l7 = await prisma.listing.create({
		data: {
			title: 'Monitor Dell 24 cale IPS',
			description:
				'Rozdzielczość FullHD, złącza HDMI i DisplayPort. Świetne odwzorowanie kolorów.',
			price: 350.0,
			contact: '507-890-123',
			status: ListingStatus.AVAILABLE,
			authorId: u9.id,
			neighborhoodId: n5.id,
		},
	})
	const l8 = await prisma.listing.create({
		data: {
			title: 'Roślina Monstera Deliciosa',
			description:
				'Duży, zdrowy okaz z pięknymi, dziurawymi liśćmi. Sprzedaję razem z doniczką.',
			price: 80.0,
			contact: '708-901-234',
			status: ListingStatus.AVAILABLE,
			authorId: u10.id,
			neighborhoodId: n5.id,
		},
	})
	const l9 = await prisma.listing.create({
		data: {
			title: 'Kask motocyklowy HJC rozmiar M',
			description:
				'Użyty zaledwie kilka razy przez pasażera. Blenda przeciwsłoneczna, czarny mat.',
			price: 450.0,
			contact: '809-012-345',
			status: ListingStatus.AVAILABLE,
			authorId: u4.id,
			neighborhoodId: n2.id,
		},
	})
	const l10 = await prisma.listing.create({
		data: {
			title: 'Głośnik bezprzewodowy JBL Charge 4',
			description:
				'Gra głośno, bateria trzyma znakomicie. Kolor moro, w zestawie kabel ładowania.',
			price: 280.0,
			contact: '901-234-561',
			status: ListingStatus.AVAILABLE,
			authorId: u3.id,
			neighborhoodId: n1.id,
		},
	})

	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
			listingId: l1.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
			listingId: l2.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
			listingId: l3.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80',
			listingId: l5.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
			listingId: l6.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
			listingId: l7.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
			listingId: l8.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80',
			listingId: l9.id,
		},
	})
	await prisma.listingImage.create({
		data: {
			url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
			listingId: l10.id,
		},
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})

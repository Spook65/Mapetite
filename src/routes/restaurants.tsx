import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowUpDown,
	Clock,
	DollarSign,
	Filter,
	Heart,
	MapPin,
	Navigation,
	Search,
	SlidersHorizontal,
	Star,
	Utensils,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/restaurants")({
	component: App,
});

// Types and Interfaces
interface Review {
	id: string;
	author: string;
	rating: number;
	comment: string;
	date: string;
}

interface Restaurant {
	id: string;
	name: string;
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};
	rating: number;
	reviewCount: number;
	categories: string[];
	priceRange: number; // 1-4 ($, $$, $$$, $$$$)
	description: string;
	latitude: number;
	longitude: number;
	reviews: Review[];
	distance?: number; // Distance in miles from user location
	isOpenNow?: boolean; // Whether the restaurant is currently open
	hours?: {
		open: string;
		close: string;
	};
}

interface LocationState {
	country: string;
	state: string;
	city: string;
	latitude?: number;
	longitude?: number;
}

// Location data structure
interface LocationData {
	[country: string]: {
		[state: string]: string[];
	};
}

// Comprehensive global location data with all major countries, states/provinces, and cities
const LOCATION_DATA: LocationData = {
	"United States": {
		Alabama: [
			"Alabaster",
			"Anniston",
			"Auburn",
			"Birmingham",
			"Decatur",
			"Dothan",
			"Florence",
			"Gadsden",
			"Hoover",
			"Huntsville",
			"Madison",
			"Mobile",
			"Montgomery",
			"Opelika",
			"Phenix City",
			"Prattville",
			"Tuscaloosa",
			"Vestavia Hills",
		],
		Alaska: [
			"Anchorage",
			"Badger",
			"College",
			"Eagle River",
			"Fairbanks",
			"Juneau",
			"Ketchikan",
			"Kodiak",
			"Palmer",
			"Sitka",
			"Soldotna",
			"Wasilla",
		],
		Arizona: [
			"Apache Junction",
			"Avondale",
			"Buckeye",
			"Bullhead City",
			"Casa Grande",
			"Casas Adobes",
			"Catalina Foothills",
			"Chandler",
			"Flagstaff",
			"Fountain Hills",
			"Gilbert",
			"Glendale",
			"Goodyear",
			"Lake Havasu City",
			"Maricopa",
			"Mesa",
			"Oro Valley",
			"Peoria",
			"Phoenix",
			"Prescott",
			"Prescott Valley",
			"Queen Creek",
			"Scottsdale",
			"Sierra Vista",
			"Sun City",
			"Surprise",
			"Tempe",
			"Tucson",
			"Yuma",
		],
		Arkansas: [
			"Bentonville",
			"Benton",
			"Bryant",
			"Conway",
			"Fayetteville",
			"Fort Smith",
			"Hot Springs",
			"Jacksonville",
			"Jonesboro",
			"Little Rock",
			"North Little Rock",
			"Pine Bluff",
			"Rogers",
			"Russellville",
			"Sherwood",
			"Springdale",
			"Texarkana",
		],
		California: [
			"Alameda",
			"Alhambra",
			"Anaheim",
			"Antioch",
			"Apple Valley",
			"Arcadia",
			"Bakersfield",
			"Baldwin Park",
			"Bellflower",
			"Berkeley",
			"Buena Park",
			"Burbank",
			"Camarillo",
			"Carlsbad",
			"Carson",
			"Cathedral City",
			"Cerritos",
			"Chico",
			"Chino",
			"Chino Hills",
			"Chula Vista",
			"Citrus Heights",
			"Clovis",
			"Compton",
			"Concord",
			"Corona",
			"Costa Mesa",
			"Cupertino",
			"Daly City",
			"Davis",
			"Delano",
			"Diamond Bar",
			"Downey",
			"Dublin",
			"El Cajon",
			"El Monte",
			"Elk Grove",
			"Encinitas",
			"Escondido",
			"Fairfield",
			"Folsom",
			"Fontana",
			"Fremont",
			"Fresno",
			"Fullerton",
			"Garden Grove",
			"Gardena",
			"Gilroy",
			"Glendale",
			"Glendora",
			"Hanford",
			"Hawthorne",
			"Hayward",
			"Hemet",
			"Hesperia",
			"Huntington Beach",
			"Indio",
			"Inglewood",
			"Irvine",
			"La Habra",
			"La Mesa",
			"Laguna Niguel",
			"Lake Elsinore",
			"Lake Forest",
			"Lakewood",
			"Lancaster",
			"Livermore",
			"Lodi",
			"Long Beach",
			"Los Angeles",
			"Lynwood",
			"Manteca",
			"Menifee",
			"Merced",
			"Milpitas",
			"Mission Viejo",
			"Modesto",
			"Montebello",
			"Monterey",
			"Monterey Park",
			"Moreno Valley",
			"Mountain View",
			"Murrieta",
			"Napa",
			"National City",
			"Newport Beach",
			"Norwalk",
			"Novato",
			"Oakland",
			"Oceanside",
			"Ontario",
			"Orange",
			"Oxnard",
			"Palm Desert",
			"Palm Springs",
			"Palmdale",
			"Palo Alto",
			"Paramount",
			"Pasadena",
			"Perris",
			"Petaluma",
			"Pico Rivera",
			"Pittsburg",
			"Placentia",
			"Pleasanton",
			"Pomona",
			"Porterville",
			"Poway",
			"Rancho Cordova",
			"Rancho Cucamonga",
			"Redding",
			"Redlands",
			"Redondo Beach",
			"Redwood City",
			"Rialto",
			"Richmond",
			"Riverside",
			"Rocklin",
			"Rosemead",
			"Roseville",
			"Sacramento",
			"Salinas",
			"San Bernardino",
			"San Bruno",
			"San Buenaventura (Ventura)",
			"San Clemente",
			"San Diego",
			"San Francisco",
			"San Jose",
			"San Leandro",
			"San Luis Obispo",
			"San Marcos",
			"San Mateo",
			"San Rafael",
			"San Ramon",
			"Santa Ana",
			"Santa Barbara",
			"Santa Clara",
			"Santa Clarita",
			"Santa Cruz",
			"Santa Maria",
			"Santa Monica",
			"Santa Rosa",
			"Santee",
			"Simi Valley",
			"South Gate",
			"South San Francisco",
			"Stockton",
			"Sunnyvale",
			"Temecula",
			"Thousand Oaks",
			"Torrance",
			"Tracy",
			"Tulare",
			"Turlock",
			"Tustin",
			"Union City",
			"Upland",
			"Vacaville",
			"Vallejo",
			"Victorville",
			"Visalia",
			"Vista",
			"Walnut Creek",
			"Watsonville",
			"West Covina",
			"West Sacramento",
			"Westminster",
			"Whittier",
			"Woodland",
			"Yorba Linda",
			"Yuba City",
		],
		Colorado: [
			"Arvada",
			"Aurora",
			"Boulder",
			"Broomfield",
			"Castle Rock",
			"Centennial",
			"Colorado Springs",
			"Commerce City",
			"Denver",
			"Fort Collins",
			"Grand Junction",
			"Greeley",
			"Highlands Ranch",
			"Lakewood",
			"Littleton",
			"Longmont",
			"Loveland",
			"Northglenn",
			"Parker",
			"Pueblo",
			"Thornton",
			"Westminster",
		],
		Connecticut: [
			"Bridgeport",
			"Bristol",
			"Danbury",
			"East Hartford",
			"Fairfield",
			"Greenwich",
			"Hartford",
			"Manchester",
			"Meriden",
			"Milford",
			"New Britain",
			"New Haven",
			"Norwalk",
			"Shelton",
			"Stamford",
			"Stratford",
			"Torrington",
			"Waterbury",
			"West Haven",
		],
		Delaware: [
			"Bear",
			"Dover",
			"Middletown",
			"Newark",
			"Pike Creek",
			"Wilmington",
		],
		Florida: [
			"Altamonte Springs",
			"Apopka",
			"Boca Raton",
			"Bonita Springs",
			"Boynton Beach",
			"Bradenton",
			"Brandon",
			"Cape Coral",
			"Clearwater",
			"Coconut Creek",
			"Cooper City",
			"Coral Gables",
			"Coral Springs",
			"Davie",
			"Daytona Beach",
			"Deerfield Beach",
			"Delray Beach",
			"Deltona",
			"Fort Lauderdale",
			"Fort Myers",
			"Fort Pierce",
			"Gainesville",
			"Greenacres",
			"Hialeah",
			"Hollywood",
			"Homestead",
			"Jacksonville",
			"Jupiter",
			"Kendall",
			"Kissimmee",
			"Lakeland",
			"Largo",
			"Lauderhill",
			"Margate",
			"Melbourne",
			"Miami",
			"Miami Beach",
			"Miami Gardens",
			"Miramar",
			"Naples",
			"North Miami",
			"North Port",
			"Ocala",
			"Orlando",
			"Oviedo",
			"Palm Bay",
			"Palm Beach Gardens",
			"Palm Coast",
			"Palm Harbor",
			"Pembroke Pines",
			"Pensacola",
			"Pine Hills",
			"Plantation",
			"Pompano Beach",
			"Port Orange",
			"Port St. Lucie",
			"Riverview",
			"Sanford",
			"Sarasota",
			"Spring Hill",
			"St. Cloud",
			"St. Petersburg",
			"Sunrise",
			"Tallahassee",
			"Tamarac",
			"Tampa",
			"The Villages",
			"Town 'n' Country",
			"Venice",
			"Wellington",
			"West Palm Beach",
			"Weston",
			"Winter Garden",
			"Winter Haven",
		],
		Georgia: [
			"Albany",
			"Alpharetta",
			"Athens",
			"Atlanta",
			"Augusta",
			"Columbus",
			"Dalton",
			"Douglasville",
			"Duluth",
			"East Point",
			"Gainesville",
			"Johns Creek",
			"Kennesaw",
			"Lawrenceville",
			"Macon",
			"Marietta",
			"Milton",
			"Newnan",
			"Peachtree City",
			"Roswell",
			"Sandy Springs",
			"Savannah",
			"Smyrna",
			"Stonecrest",
			"Valdosta",
			"Warner Robins",
		],
		Hawaii: [
			"Ewa Beach",
			"Hilo",
			"Honolulu",
			"Kailua",
			"Kaneohe",
			"Kapolei",
			"Kihei",
			"Mililani",
			"Pearl City",
			"Wahiawa",
			"Waipahu",
		],
		Idaho: [
			"Boise",
			"Caldwell",
			"Coeur d'Alene",
			"Idaho Falls",
			"Lewiston",
			"Meridian",
			"Moscow",
			"Nampa",
			"Pocatello",
			"Post Falls",
			"Rexburg",
			"Twin Falls",
		],
		Illinois: [
			"Arlington Heights",
			"Aurora",
			"Berwyn",
			"Bloomington",
			"Bolingbrook",
			"Buffalo Grove",
			"Champaign",
			"Chicago",
			"Cicero",
			"Decatur",
			"DeKalb",
			"Des Plaines",
			"Downers Grove",
			"Elgin",
			"Evanston",
			"Hoffman Estates",
			"Joliet",
			"Lombard",
			"Mount Prospect",
			"Naperville",
			"Normal",
			"Oak Lawn",
			"Oak Park",
			"Orland Park",
			"Palatine",
			"Peoria",
			"Quincy",
			"Rock Island",
			"Rockford",
			"Schaumburg",
			"Skokie",
			"Springfield",
			"Tinley Park",
			"Urbana",
			"Waukegan",
			"Wheaton",
		],
		Indiana: [
			"Anderson",
			"Bloomington",
			"Carmel",
			"Columbus",
			"Crown Point",
			"Elkhart",
			"Evansville",
			"Fishers",
			"Fort Wayne",
			"Gary",
			"Goshen",
			"Granger",
			"Greenwood",
			"Hammond",
			"Indianapolis",
			"Jeffersonville",
			"Kokomo",
			"Lafayette",
			"Lawrence",
			"Merrillville",
			"Mishawaka",
			"Muncie",
			"Noblesville",
			"Portage",
			"Richmond",
			"South Bend",
			"Terre Haute",
			"Valparaiso",
			"Westfield",
		],
		Iowa: [
			"Ames",
			"Ankeny",
			"Bettendorf",
			"Burlington",
			"Cedar Falls",
			"Cedar Rapids",
			"Clinton",
			"Council Bluffs",
			"Davenport",
			"Des Moines",
			"Dubuque",
			"Iowa City",
			"Marion",
			"Marshalltown",
			"Mason City",
			"Sioux City",
			"Urbandale",
			"Waterloo",
			"West Des Moines",
		],
		Kansas: [
			"Derby",
			"Dodge City",
			"Garden City",
			"Hutchinson",
			"Kansas City",
			"Lawrence",
			"Leavenworth",
			"Leawood",
			"Lenexa",
			"Manhattan",
			"Olathe",
			"Overland Park",
			"Salina",
			"Shawnee",
			"Topeka",
			"Wichita",
		],
		Kentucky: [
			"Bowling Green",
			"Covington",
			"Elizabethtown",
			"Florence",
			"Frankfort",
			"Georgetown",
			"Henderson",
			"Hopkinsville",
			"Jeffersontown",
			"Lexington",
			"Louisville",
			"Nicholasville",
			"Owensboro",
			"Paducah",
			"Richmond",
		],
		Louisiana: [
			"Alexandria",
			"Baton Rouge",
			"Bossier City",
			"Central",
			"Houma",
			"Kenner",
			"Lafayette",
			"Lake Charles",
			"Marrero",
			"Metairie",
			"Monroe",
			"New Iberia",
			"New Orleans",
			"Prairieville",
			"Shreveport",
			"Slidell",
		],
		Maine: [
			"Auburn",
			"Augusta",
			"Bangor",
			"Biddeford",
			"Brunswick",
			"Lewiston",
			"Portland",
			"Saco",
			"Sanford",
			"South Portland",
			"Westbrook",
		],
		Maryland: [
			"Annapolis",
			"Baltimore",
			"Bel Air",
			"Bowie",
			"Columbia",
			"Dundalk",
			"Ellicott City",
			"Frederick",
			"Gaithersburg",
			"Germantown",
			"Glen Burnie",
			"Hagerstown",
			"Rockville",
			"Salisbury",
			"Silver Spring",
			"Towson",
			"Waldorf",
		],
		Massachusetts: [
			"Attleboro",
			"Barnstable",
			"Beverly",
			"Boston",
			"Brockton",
			"Brookline",
			"Cambridge",
			"Chicopee",
			"Everett",
			"Fall River",
			"Fitchburg",
			"Framingham",
			"Haverhill",
			"Lawrence",
			"Leominster",
			"Lowell",
			"Lynn",
			"Malden",
			"Marlborough",
			"Medford",
			"New Bedford",
			"Newton",
			"Peabody",
			"Pittsfield",
			"Quincy",
			"Revere",
			"Salem",
			"Somerville",
			"Springfield",
			"Taunton",
			"Waltham",
			"Weymouth",
			"Woburn",
			"Worcester",
		],
		Michigan: [
			"Ann Arbor",
			"Battle Creek",
			"Bay City",
			"Dearborn",
			"Dearborn Heights",
			"Detroit",
			"East Lansing",
			"Eastpointe",
			"Farmington Hills",
			"Flint",
			"Grand Rapids",
			"Holland",
			"Jackson",
			"Kalamazoo",
			"Kentwood",
			"Lansing",
			"Lincoln Park",
			"Livonia",
			"Midland",
			"Muskegon",
			"Novi",
			"Pontiac",
			"Port Huron",
			"Portage",
			"Rochester Hills",
			"Roseville",
			"Royal Oak",
			"Saginaw",
			"Southfield",
			"St. Clair Shores",
			"Sterling Heights",
			"Taylor",
			"Troy",
			"Warren",
			"Westland",
			"Wyoming",
		],
		Minnesota: [
			"Apple Valley",
			"Blaine",
			"Bloomington",
			"Brooklyn Park",
			"Burnsville",
			"Coon Rapids",
			"Cottage Grove",
			"Duluth",
			"Eagan",
			"Eden Prairie",
			"Edina",
			"Lakeville",
			"Maple Grove",
			"Maplewood",
			"Minnetonka",
			"Minneapolis",
			"Moorhead",
			"Owatonna",
			"Plymouth",
			"Rochester",
			"Savage",
			"Shakopee",
			"St. Cloud",
			"St. Louis Park",
			"St. Paul",
			"Winona",
			"Woodbury",
		],
		Mississippi: [
			"Biloxi",
			"Brandon",
			"Clinton",
			"Columbus",
			"Greenville",
			"Gulfport",
			"Hattiesburg",
			"Horn Lake",
			"Jackson",
			"Madison",
			"Meridian",
			"Olive Branch",
			"Oxford",
			"Pearl",
			"Ridgeland",
			"Southaven",
			"Tupelo",
			"Vicksburg",
		],
		Missouri: [
			"Ballwin",
			"Blue Springs",
			"Cape Girardeau",
			"Chesterfield",
			"Columbia",
			"Florissant",
			"Independence",
			"Jefferson City",
			"Joplin",
			"Kansas City",
			"Lee's Summit",
			"Liberty",
			"O'Fallon",
			"Ozark",
			"Raymore",
			"Springfield",
			"St. Charles",
			"St. Joseph",
			"St. Louis",
			"St. Peters",
			"Wentzville",
		],
		Montana: [
			"Billings",
			"Bozeman",
			"Butte",
			"Great Falls",
			"Helena",
			"Kalispell",
			"Missoula",
		],
		Nebraska: [
			"Bellevue",
			"Columbus",
			"Fremont",
			"Grand Island",
			"Hastings",
			"Kearney",
			"Lincoln",
			"Norfolk",
			"North Platte",
			"Omaha",
			"Papillion",
		],
		Nevada: [
			"Carson City",
			"Enterprise",
			"Henderson",
			"Las Vegas",
			"North Las Vegas",
			"Paradise",
			"Pahrump",
			"Reno",
			"Spanish Springs",
			"Sparks",
			"Spring Valley",
			"Summerlin South",
			"Sunrise Manor",
			"Whitney",
		],
		"New Hampshire": [
			"Concord",
			"Derry",
			"Dover",
			"Hudson",
			"Keene",
			"Laconia",
			"Manchester",
			"Merrimack",
			"Nashua",
			"Portsmouth",
			"Rochester",
			"Salem",
		],
		"New Jersey": [
			"Atlantic City",
			"Bayonne",
			"Bridgeton",
			"Camden",
			"Cherry Hill",
			"Clifton",
			"East Orange",
			"Edison",
			"Elizabeth",
			"Hoboken",
			"Jackson",
			"Jersey City",
			"Lakewood",
			"Newark",
			"New Brunswick",
			"Passaic",
			"Paterson",
			"Perth Amboy",
			"Plainfield",
			"Sayreville",
			"Toms River",
			"Trenton",
			"Union City",
			"Vineland",
			"West New York",
			"Woodbridge",
		],
		"New Mexico": [
			"Alamogordo",
			"Albuquerque",
			"Carlsbad",
			"Clovis",
			"Farmington",
			"Hobbs",
			"Las Cruces",
			"Rio Rancho",
			"Roswell",
			"Santa Fe",
		],
		"New York": [
			"Albany",
			"Binghamton",
			"Bronx",
			"Brooklyn",
			"Buffalo",
			"Cheektowaga",
			"Hempstead",
			"Irondequoit",
			"Ithaca",
			"Manhattan",
			"Mount Vernon",
			"New Rochelle",
			"New York City",
			"Niagara Falls",
			"Queens",
			"Rochester",
			"Schenectady",
			"Staten Island",
			"Syracuse",
			"Troy",
			"Utica",
			"West Seneca",
			"White Plains",
			"Yonkers",
		],
		"North Carolina": [
			"Apex",
			"Asheville",
			"Burlington",
			"Cary",
			"Chapel Hill",
			"Charlotte",
			"Concord",
			"Durham",
			"Fayetteville",
			"Gastonia",
			"Goldsboro",
			"Greensboro",
			"Greenville",
			"Hickory",
			"High Point",
			"Huntersville",
			"Jacksonville",
			"Kannapolis",
			"Monroe",
			"Mooresville",
			"Morrisville",
			"Raleigh",
			"Rocky Mount",
			"Salisbury",
			"Wake Forest",
			"Wilmington",
			"Wilson",
			"Winston-Salem",
		],
		"North Dakota": [
			"Bismarck",
			"Dickinson",
			"Fargo",
			"Grand Forks",
			"Jamestown",
			"Mandan",
			"Minot",
			"Wahpeton",
			"West Fargo",
			"Williston",
		],
		Ohio: [
			"Akron",
			"Beavercreek",
			"Boardman",
			"Bowling Green",
			"Canton",
			"Cincinnati",
			"Cleveland",
			"Cleveland Heights",
			"Columbus",
			"Cuyahoga Falls",
			"Dayton",
			"Delaware",
			"Dublin",
			"Elyria",
			"Euclid",
			"Fairborn",
			"Fairfield",
			"Findlay",
			"Grove City",
			"Hamilton",
			"Hilliard",
			"Huber Heights",
			"Kettering",
			"Lakewood",
			"Lancaster",
			"Lima",
			"Lorain",
			"Mansfield",
			"Marion",
			"Mentor",
			"Newark",
			"Parma",
			"Reynoldsburg",
			"Sandusky",
			"Springfield",
			"Strongsville",
			"Toledo",
			"Westerville",
			"Westlake",
			"Youngstown",
		],
		Oklahoma: [
			"Bartlesville",
			"Broken Arrow",
			"Edmond",
			"Enid",
			"Lawton",
			"Midwest City",
			"Moore",
			"Muskogee",
			"Norman",
			"Oklahoma City",
			"Owasso",
			"Ponca City",
			"Shawnee",
			"Stillwater",
			"Tulsa",
			"Yukon",
		],
		Oregon: [
			"Albany",
			"Aloha",
			"Bend",
			"Beaverton",
			"Corvallis",
			"Eugene",
			"Grants Pass",
			"Gresham",
			"Hillsboro",
			"Keizer",
			"Lake Oswego",
			"McMinnville",
			"Medford",
			"Oregon City",
			"Portland",
			"Redmond",
			"Salem",
			"Springfield",
			"Tigard",
			"Tualatin",
			"West Linn",
			"Woodburn",
		],
		Pennsylvania: [
			"Allentown",
			"Altoona",
			"Bethlehem",
			"Chester",
			"Erie",
			"Harrisburg",
			"Lancaster",
			"Lebanon",
			"Levittown",
			"Monroeville",
			"Norristown",
			"Philadelphia",
			"Pittsburgh",
			"Plum",
			"Reading",
			"Scranton",
			"State College",
			"Wilkes-Barre",
			"York",
		],
		"Rhode Island": [
			"Central Falls",
			"Cranston",
			"Cumberland",
			"East Providence",
			"Newport",
			"North Providence",
			"Pawtucket",
			"Providence",
			"Warwick",
			"Woonsocket",
		],
		"South Carolina": [
			"Aiken",
			"Anderson",
			"Charleston",
			"Columbia",
			"Florence",
			"Goose Creek",
			"Greenville",
			"Greer",
			"Hilton Head Island",
			"Mauldin",
			"Mount Pleasant",
			"Myrtle Beach",
			"North Charleston",
			"Rock Hill",
			"Simpsonville",
			"Spartanburg",
			"Summerville",
			"Sumter",
		],
		"South Dakota": [
			"Aberdeen",
			"Brandon",
			"Brookings",
			"Harrisburg",
			"Mitchell",
			"Pierre",
			"Rapid City",
			"Sioux Falls",
			"Spearfish",
			"Vermillion",
			"Watertown",
			"Yankton",
		],
		Tennessee: [
			"Bartlett",
			"Brentwood",
			"Bristol",
			"Chattanooga",
			"Clarksville",
			"Cleveland",
			"Collierville",
			"Columbia",
			"Cookeville",
			"Franklin",
			"Gallatin",
			"Germantown",
			"Hendersonville",
			"Jackson",
			"Johnson City",
			"Kingsport",
			"Knoxville",
			"Lebanon",
			"Memphis",
			"Morristown",
			"Murfreesboro",
			"Nashville",
			"Smyrna",
			"Spring Hill",
		],
		Texas: [
			"Abilene",
			"Allen",
			"Amarillo",
			"Arlington",
			"Atascocita",
			"Austin",
			"Baytown",
			"Beaumont",
			"Bedford",
			"Brownsville",
			"Bryan",
			"Burleson",
			"Carrollton",
			"Cedar Hill",
			"Cedar Park",
			"Channelview",
			"Cleburne",
			"College Station",
			"Conroe",
			"Coppell",
			"Corpus Christi",
			"Dallas",
			"DeSoto",
			"Denton",
			"Duncanville",
			"Edinburgh",
			"El Paso",
			"Euless",
			"Flower Mound",
			"Fort Worth",
			"Friendswood",
			"Frisco",
			"Galveston",
			"Garland",
			"Georgetown",
			"Grand Prairie",
			"Grapevine",
			"Haltom City",
			"Harlingen",
			"Houston",
			"Humble",
			"Hurst",
			"Irving",
			"Katy",
			"Keller",
			"Killeen",
			"Kingsville",
			"Kyle",
			"La Porte",
			"Lake Jackson",
			"Lancaster",
			"Laredo",
			"League City",
			"Leander",
			"Lewisville",
			"Longview",
			"Lubbock",
			"Mansfield",
			"McAllen",
			"McKinney",
			"Mesquite",
			"Midland",
			"Mission",
			"Missouri City",
			"New Braunfels",
			"North Richland Hills",
			"Odessa",
			"Pasadena",
			"Pearland",
			"Pflugerville",
			"Pharr",
			"Plano",
			"Port Arthur",
			"Richardson",
			"Rockwall",
			"Round Rock",
			"Rowlett",
			"San Angelo",
			"San Antonio",
			"San Marcos",
			"Schertz",
			"Seguin",
			"Sherman",
			"Sugar Land",
			"Temple",
			"Texarkana",
			"Texas City",
			"The Colony",
			"The Woodlands",
			"Tyler",
			"Victoria",
			"Waco",
			"Watauga",
			"Waxahachie",
			"Weatherford",
			"Weslaco",
			"Wichita Falls",
			"Wylie",
		],
		Utah: [
			"American Fork",
			"Bountiful",
			"Cedar City",
			"Clearfield",
			"Cottonwood Heights",
			"Draper",
			"Herriman",
			"Holladay",
			"Kaysville",
			"Layton",
			"Lehi",
			"Logan",
			"Midvale",
			"Millcreek",
			"Murray",
			"Ogden",
			"Orem",
			"Provo",
			"Riverton",
			"Roy",
			"Salt Lake City",
			"Sandy",
			"South Jordan",
			"Spanish Fork",
			"St. George",
			"Taylorsville",
			"Tooele",
			"West Jordan",
			"West Valley City",
		],
		Vermont: [
			"Bennington",
			"Brattleboro",
			"Burlington",
			"Colchester",
			"Essex",
			"Hartford",
			"Montpelier",
			"Rutland",
			"South Burlington",
			"Williston",
		],
		Virginia: [
			"Alexandria",
			"Arlington",
			"Blacksburg",
			"Centreville",
			"Charlottesville",
			"Chesapeake",
			"Dale City",
			"Danville",
			"Hampton",
			"Harrisonburg",
			"Leesburg",
			"Lynchburg",
			"Manassas",
			"Newport News",
			"Norfolk",
			"Petersburg",
			"Portsmouth",
			"Reston",
			"Richmond",
			"Roanoke",
			"Suffolk",
			"Tuckahoe",
			"Virginia Beach",
			"Winchester",
		],
		Washington: [
			"Auburn",
			"Bellevue",
			"Bellingham",
			"Bothell",
			"Bremerton",
			"Burien",
			"Edmonds",
			"Everett",
			"Federal Way",
			"Issaquah",
			"Kennewick",
			"Kent",
			"Kirkland",
			"Lacey",
			"Lake Stevens",
			"Lakewood",
			"Lynnwood",
			"Marysville",
			"Mount Vernon",
			"Olympia",
			"Pasco",
			"Pullman",
			"Puyallup",
			"Redmond",
			"Renton",
			"Richland",
			"Sammamish",
			"SeaTac",
			"Seattle",
			"Shoreline",
			"Spokane",
			"Spokane Valley",
			"Tacoma",
			"University Place",
			"Vancouver",
			"Walla Walla",
			"Wenatchee",
			"Yakima",
		],
		"West Virginia": [
			"Beckley",
			"Charleston",
			"Huntington",
			"Martinsburg",
			"Morgantown",
			"Parkersburg",
			"South Charleston",
			"Weirton",
			"Wheeling",
		],
		Wisconsin: [
			"Appleton",
			"Beloit",
			"Brookfield",
			"Eau Claire",
			"Fitchburg",
			"Fond du Lac",
			"Franklin",
			"Green Bay",
			"Greenfield",
			"Janesville",
			"Kenosha",
			"La Crosse",
			"Madison",
			"Manitowoc",
			"Menomonee Falls",
			"Milwaukee",
			"Mount Pleasant",
			"Muskego",
			"Neenah",
			"New Berlin",
			"Oak Creek",
			"Oshkosh",
			"Racine",
			"Sheboygan",
			"Sun Prairie",
			"Superior",
			"Waukesha",
			"Wauwatosa",
			"West Allis",
			"West Bend",
		],
		Wyoming: [
			"Casper",
			"Cheyenne",
			"Cody",
			"Evanston",
			"Gillette",
			"Green River",
			"Jackson",
			"Laramie",
			"Riverton",
			"Rock Springs",
			"Sheridan",
		],
	},
	"South Africa": {
		"Eastern Cape": ["East London", "Makhanda", "Port Elizabeth"],
		"Free State": ["Bloemfontein", "Welkom"],
		Gauteng: ["Johannesburg", "Pretoria", "Soweto", "Tshwane", "Vereeniging"],
		"KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay"],
		Limpopo: ["Polokwane"],
		Mpumalanga: ["Mbombela", "Witbank"],
		"North West": ["Rustenburg"],
		"Northern Cape": ["Kimberley"],
		"Western Cape": ["Cape Town", "George", "Stellenbosch"],
	},
	Nigeria: {
		Abia: ["Aba", "Umuahia"],
		Adamawa: ["Yola"],
		"Akwa Ibom": ["Uyo"],
		Anambra: ["Awka", "Onitsha"],
		Bauchi: ["Bauchi"],
		Bayelsa: ["Yenagoa"],
		Benue: ["Makurdi"],
		Borno: ["Maiduguri"],
		"Cross River": ["Calabar"],
		Delta: ["Asaba", "Warri"],
		Ebonyi: ["Abakaliki"],
		Edo: ["Benin City"],
		Ekiti: ["Ado-Ekiti"],
		Enugu: ["Enugu"],
		"Federal Capital Territory": ["Abuja"],
		Gombe: ["Gombe"],
		Imo: ["Owerri"],
		Jigawa: ["Dutse"],
		Kaduna: ["Kaduna", "Zaria"],
		Kano: ["Kano"],
		Katsina: ["Katsina"],
		Kebbi: ["Birnin Kebbi"],
		Kogi: ["Lokoja"],
		Kwara: ["Ilorin"],
		Lagos: ["Ikeja", "Lagos"],
		Nasarawa: ["Lafia"],
		Niger: ["Minna"],
		Ogun: ["Abeokuta", "Ijebu Ode"],
		Ondo: ["Akure"],
		Osun: ["Ede", "Oshogbo"],
		Oyo: ["Ibadan", "Ogbomosho"],
		Plateau: ["Jos"],
		Rivers: ["Port Harcourt"],
		Sokoto: ["Sokoto"],
		Taraba: ["Jalingo"],
		Yobe: ["Damaturu"],
		Zamfara: ["Gusau"],
	},
	"New Zealand": {
		Auckland: ["Auckland"],
		"Bay of Plenty": ["Tauranga"],
		Canterbury: ["Christchurch"],
		Gisborne: ["Gisborne"],
		"Hawke's Bay": ["Hastings", "Napier"],
		"Manawatu-Wanganui": ["Palmerston North", "Whanganui"],
		Marlborough: ["Blenheim"],
		Nelson: ["Nelson"],
		Northland: ["Whangarei"],
		Otago: ["Dunedin"],
		Southland: ["Invercargill"],
		Taranaki: ["New Plymouth"],
		Tasman: ["Richmond"],
		Waikato: ["Hamilton"],
		Wellington: ["Lower Hutt", "Porirua", "Upper Hutt", "Wellington"],
		"West Coast": ["Greymouth"],
	},
	Netherlands: {
		Drenthe: ["Assen", "Emmen"],
		Flevoland: ["Almere", "Lelystad"],
		Friesland: ["Heerenveen", "Leeuwarden"],
		Gelderland: ["Apeldoorn", "Arnhem", "Ede", "Nijmegen"],
		Groningen: ["Groningen"],
		Limburg: ["Heerlen", "Maastricht", "Sittard-Geleen", "Venlo"],
		"North Brabant": [
			"'s-Hertogenbosch",
			"Breda",
			"Eindhoven",
			"Helmond",
			"Tilburg",
		],
		"North Holland": [
			"Alkmaar",
			"Amstelveen",
			"Amsterdam",
			"Haarlem",
			"Haarlemmermeer",
			"Zaanstad",
		],
		Overijssel: ["Almelo", "Deventer", "Enschede", "Hengelo", "Zwolle"],
		Utrecht: ["Amersfoort", "Nieuwegein", "Utrecht"],
		Zeeland: ["Goes", "Terneuzen", "Vlissingen"],
		"South Holland": [
			"Delft",
			"Dordrecht",
			"Leiden",
			"Rotterdam",
			"The Hague",
			"Zoetermeer",
		],
	},
	Turkey: {
		Adana: ["Adana"],
		Ankara: ["Ankara"],
		Antalya: ["Alanya", "Antalya"],
		Bursa: ["Bursa"],
		Denizli: ["Denizli"],
		Diyarbakır: ["Diyarbakır"],
		Erzurum: ["Erzurum"],
		Eskişehir: ["Eskişehir"],
		Gaziantep: ["Gaziantep"],
		Istanbul: ["Istanbul"],
		İzmir: ["İzmir"],
		Kayseri: ["Kayseri"],
		Kocaeli: ["Gebze", "Kocaeli"],
		Konya: ["Konya"],
		Mersin: ["Mersin", "Tarsus"],
		Sakarya: ["Adapazarı"],
		Samsun: ["Samsun"],
		Şanlıurfa: ["Şanlıurfa"],
		Trabzon: ["Trabzon"],
	},
	Egypt: {
		Alexandria: ["Alexandria"],
		Aswan: ["Aswan"],
		Asyut: ["Asyut"],
		Cairo: ["Cairo", "Giza"],
		Dakahlia: ["Mansoura"],
		Gharbia: ["Tanta"],
		Ismailia: ["Ismailia"],
		Luxor: ["Luxor"],
		"Port Said": ["Port Said"],
		Qalyubia: ["Banha"],
		"Red Sea": ["Hurghada"],
		Sharqia: ["Zagazig"],
		"South Sinai": ["Sharm el-Sheikh"],
		Suez: ["Suez"],
	},
	Russia: {
		Moscow: ["Moscow"],
		"Saint Petersburg": ["Saint Petersburg"],
		"Nizhny Novgorod": ["Nizhny Novgorod"],
		Yekaterinburg: ["Yekaterinburg"],
		Kazan: ["Kazan"],
		Novosibirsk: ["Novosibirsk"],
		Chelyabinsk: ["Chelyabinsk"],
		Samara: ["Samara"],
		Omsk: ["Omsk"],
		"Rostov-on-Don": ["Rostov-on-Don"],
		Ufa: ["Ufa"],
		Krasnoyarsk: ["Krasnoyarsk"],
		Voronezh: ["Voronezh"],
		Perm: ["Perm"],
		Volgograd: ["Volgograd"],
	},
	Poland: {
		"Greater Poland": ["Kalisz", "Konin", "Poznań"],
		"Kuyavian-Pomeranian": ["Bydgoszcz", "Toruń", "Włocławek"],
		"Lesser Poland": ["Kraków", "Nowy Sącz", "Tarnów"],
		Łódź: ["Łódź", "Piotrków Trybunalski"],
		"Lower Silesian": ["Legnica", "Wałbrzych", "Wrocław"],
		Lublin: ["Lublin"],
		Lubusz: ["Gorzów Wielkopolski", "Zielona Góra"],
		Masovian: ["Płock", "Radom", "Warsaw"],
		Opole: ["Opole"],
		Podlaskie: ["Białystok"],
		Pomeranian: ["Gdańsk", "Gdynia", "Sopot", "Słupsk"],
		Silesian: [
			"Bielsko-Biała",
			"Bytom",
			"Chorzów",
			"Częstochowa",
			"Dąbrowa Górnicza",
			"Gliwice",
			"Katowice",
			"Ruda Śląska",
			"Rybnik",
			"Sosnowiec",
			"Tychy",
			"Zabrze",
		],
		Subcarpathian: ["Rzeszów"],
		"Warmian-Masurian": ["Elbląg", "Olsztyn"],
		"West Pomeranian": ["Koszalin", "Szczecin"],
	},
	Thailand: {
		Bangkok: ["Bangkok"],
		"Chiang Mai": ["Chiang Mai"],
		"Chiang Rai": ["Chiang Rai"],
		"Chon Buri": ["Chon Buri", "Pattaya"],
		Khon: ["Khon Kaen"],
		"Nakhon Ratchasima": ["Nakhon Ratchasima"],
		Nonthaburi: ["Nonthaburi"],
		"Pathum Thani": ["Pathum Thani"],
		Phuket: ["Phuket"],
		"Samut Prakan": ["Samut Prakan"],
		Songkhla: ["Hat Yai", "Songkhla"],
		"Udon Thani": ["Udon Thani"],
	},
	Malaysia: {
		Johor: ["Johor Bahru", "Muar"],
		Kedah: ["Alor Setar"],
		Kelantan: ["Kota Bharu"],
		"Kuala Lumpur": ["Kuala Lumpur"],
		Labuan: ["Labuan"],
		Malacca: ["Malacca City"],
		"Negeri Sembilan": ["Seremban"],
		Pahang: ["Kuantan"],
		Penang: ["George Town"],
		Perak: ["Ipoh"],
		Perlis: ["Kangar"],
		Putrajaya: ["Putrajaya"],
		Sabah: ["Kota Kinabalu", "Sandakan"],
		Sarawak: ["Kuching", "Miri", "Sibu"],
		Selangor: ["Klang", "Petaling Jaya", "Shah Alam", "Subang Jaya"],
		Terengganu: ["Kuala Terengganu"],
	},
	Philippines: {
		"Metro Manila": [
			"Caloocan",
			"Makati",
			"Manila",
			"Pasay",
			"Pasig",
			"Quezon City",
			"Taguig",
		],
		Calabarzon: ["Antipolo", "Batangas City", "Calamba", "Lipa"],
		"Central Luzon": [
			"Angeles",
			"Malolos",
			"Olongapo",
			"San Fernando",
			"San Jose del Monte",
		],
		"Central Visayas": ["Cebu City", "Lapu-Lapu", "Mandaue", "Tagbilaran"],
		Davao: ["Davao City", "Tagum"],
		Ilocos: ["Dagupan", "Laoag", "San Fernando"],
		"Northern Mindanao": ["Cagayan de Oro", "Iligan", "Valencia"],
		"Western Visayas": ["Bacolod", "Iloilo City"],
		Zamboanga: ["Pagadian", "Zamboanga City"],
	},
	Vietnam: {
		Hanoi: ["Hanoi"],
		"Ho Chi Minh": ["Ho Chi Minh City"],
		"Da Nang": ["Da Nang"],
		"Hai Phong": ["Hai Phong"],
		"Can Tho": ["Can Tho"],
		"Bien Hoa": ["Bien Hoa"],
		"Vung Tau": ["Vung Tau"],
		"Nha Trang": ["Nha Trang"],
		Hue: ["Hue"],
		"Buon Ma Thuot": ["Buon Ma Thuot"],
	},
	Canada: {
		Alberta: [
			"Airdrie",
			"Banff",
			"Brooks",
			"Calgary",
			"Camrose",
			"Canmore",
			"Cold Lake",
			"Edmonton",
			"Fort McMurray",
			"Grande Prairie",
			"Jasper",
			"Lethbridge",
			"Lloydminster",
			"Medicine Hat",
			"Okotoks",
			"Red Deer",
			"Sherwood Park",
			"Spruce Grove",
			"St. Albert",
			"Strathmore",
			"Sylvan Lake",
			"Taber",
			"Wetaskiwin",
			"Wood Buffalo",
		],
		"British Columbia": [
			"Abbotsford",
			"Armstrong",
			"Burnaby",
			"Campbell River",
			"Castlegar",
			"Chilliwack",
			"Colwood",
			"Coquitlam",
			"Courtenay",
			"Cranbrook",
			"Dawson Creek",
			"Delta",
			"Duncan",
			"Fernie",
			"Fort St. John",
			"Kamloops",
			"Kelowna",
			"Langford",
			"Langley",
			"Maple Ridge",
			"Nanaimo",
			"Nelson",
			"New Westminster",
			"North Vancouver",
			"Parksville",
			"Penticton",
			"Port Alberni",
			"Port Coquitlam",
			"Port Moody",
			"Powell River",
			"Prince George",
			"Prince Rupert",
			"Richmond",
			"Rossland",
			"Salmon Arm",
			"Surrey",
			"Terrace",
			"Trail",
			"Vancouver",
			"Vernon",
			"Victoria",
			"West Vancouver",
			"White Rock",
			"Whistler",
		],
		Manitoba: [
			"Brandon",
			"Dauphin",
			"Flin Flon",
			"Morden",
			"Portage la Prairie",
			"Selkirk",
			"Steinbach",
			"Thompson",
			"Winkler",
			"Winnipeg",
		],
		"New Brunswick": [
			"Bathurst",
			"Campbellton",
			"Dieppe",
			"Edmundston",
			"Fredericton",
			"Miramichi",
			"Moncton",
			"Saint John",
		],
		"Newfoundland and Labrador": [
			"Corner Brook",
			"Gander",
			"Grand Falls-Windsor",
			"Labrador City",
			"Mount Pearl",
			"Paradise",
			"St. John's",
		],
		"Northwest Territories": [
			"Yellowknife",
			"Hay River",
			"Inuvik",
			"Fort Smith",
		],
		"Nova Scotia": [
			"Amherst",
			"Antigonish",
			"Bridgewater",
			"Cape Breton",
			"Dartmouth",
			"Glace Bay",
			"Halifax",
			"Kentville",
			"New Glasgow",
			"Sydney",
			"Truro",
			"Yarmouth",
		],
		Nunavut: ["Iqaluit", "Rankin Inlet", "Arviat"],
		Ontario: [
			"Ajax",
			"Aurora",
			"Barrie",
			"Belleville",
			"Brampton",
			"Brantford",
			"Brockville",
			"Burlington",
			"Cambridge",
			"Clarence-Rockland",
			"Cornwall",
			"Guelph",
			"Haldimand County",
			"Hamilton",
			"Kawartha Lakes",
			"Kingston",
			"Kitchener",
			"London",
			"Markham",
			"Milton",
			"Mississauga",
			"Newmarket",
			"Niagara Falls",
			"Norfolk County",
			"North Bay",
			"Oakville",
			"Orillia",
			"Oshawa",
			"Ottawa",
			"Owen Sound",
			"Pembroke",
			"Peterborough",
			"Pickering",
			"Port Colborne",
			"Prince Edward County",
			"Quinte West",
			"Richmond Hill",
			"Sarnia",
			"Sault Ste. Marie",
			"St. Catharines",
			"St. Thomas",
			"Stratford",
			"Sudbury",
			"Thunder Bay",
			"Timmins",
			"Toronto",
			"Vaughan",
			"Waterloo",
			"Welland",
			"Whitby",
			"Windsor",
			"Woodstock",
		],
		"Prince Edward Island": ["Charlottetown", "Summerside", "Stratford"],
		Quebec: [
			"Alma",
			"Baie-Comeau",
			"Blainville",
			"Boucherville",
			"Brossard",
			"Châteauguay",
			"Chicoutimi",
			"Dollard-des-Ormeaux",
			"Drummondville",
			"Gatineau",
			"Granby",
			"Joliette",
			"Laval",
			"Lévis",
			"Longueuil",
			"Magog",
			"Mirabel",
			"Montreal",
			"Quebec City",
			"Repentigny",
			"Rimouski",
			"Rouyn-Noranda",
			"Saguenay",
			"Saint-Hyacinthe",
			"Saint-Jean-sur-Richelieu",
			"Saint-Jérôme",
			"Salaberry-de-Valleyfield",
			"Sept-Îles",
			"Shawinigan",
			"Sherbrooke",
			"Terrebonne",
			"Trois-Rivières",
			"Val-d'Or",
			"Victoriaville",
		],
		Saskatchewan: [
			"Estevan",
			"Lloydminster",
			"Martensville",
			"Moose Jaw",
			"North Battleford",
			"Prince Albert",
			"Regina",
			"Saskatoon",
			"Swift Current",
			"Warman",
			"Weyburn",
			"Yorkton",
		],
		Yukon: ["Whitehorse", "Dawson City", "Watson Lake"],
	},
	Australia: {
		"New South Wales": [
			"Albury",
			"Armidale",
			"Bathurst",
			"Blue Mountains",
			"Broken Hill",
			"Camden",
			"Campbelltown",
			"Cessnock",
			"Dubbo",
			"Goulburn",
			"Grafton",
			"Lithgow",
			"Liverpool",
			"Maitland",
			"Newcastle",
			"Orange",
			"Parramatta",
			"Penrith",
			"Queanbeyan",
			"Sydney",
			"Tamworth",
			"Wagga Wagga",
			"Wollongong",
		],
		Victoria: [
			"Ballarat",
			"Bendigo",
			"Dandenong",
			"Frankston",
			"Geelong",
			"Horsham",
			"Melton",
			"Melbourne",
			"Mildura",
			"Shepparton",
			"Sunbury",
			"Traralgon",
			"Wangaratta",
			"Warrnambool",
			"Wodonga",
		],
		Queensland: [
			"Brisbane",
			"Bundaberg",
			"Cairns",
			"Gladstone",
			"Gold Coast",
			"Hervey Bay",
			"Ipswich",
			"Mackay",
			"Maryborough",
			"Mount Isa",
			"Rockhampton",
			"Sunshine Coast",
			"Toowoomba",
			"Townsville",
		],
		"South Australia": [
			"Adelaide",
			"Gawler",
			"Mount Gambier",
			"Murray Bridge",
			"Port Augusta",
			"Port Lincoln",
			"Port Pirie",
			"Victor Harbor",
			"Whyalla",
		],
		"Western Australia": [
			"Albany",
			"Armadale",
			"Bunbury",
			"Busselton",
			"Fremantle",
			"Geraldton",
			"Joondalup",
			"Kalgoorlie",
			"Karratha",
			"Mandurah",
			"Perth",
			"Rockingham",
		],
		Tasmania: ["Burnie", "Devonport", "Hobart", "Launceston"],
		"Australian Capital Territory": ["Canberra"],
		"Northern Territory": ["Darwin", "Alice Springs", "Palmerston"],
	},
	Germany: {
		"Baden-Württemberg": [
			"Aalen",
			"Baden-Baden",
			"Esslingen",
			"Freiburg",
			"Heidelberg",
			"Heilbronn",
			"Karlsruhe",
			"Konstanz",
			"Ludwigsburg",
			"Mannheim",
			"Pforzheim",
			"Reutlingen",
			"Stuttgart",
			"Tübingen",
			"Ulm",
		],
		Bavaria: [
			"Augsburg",
			"Bamberg",
			"Bayreuth",
			"Erlangen",
			"Fürth",
			"Ingolstadt",
			"Munich",
			"Nuremberg",
			"Passau",
			"Regensburg",
			"Rosenheim",
			"Würzburg",
		],
		Berlin: ["Berlin"],
		Brandenburg: ["Cottbus", "Frankfurt (Oder)", "Potsdam"],
		Bremen: ["Bremen", "Bremerhaven"],
		Hamburg: ["Hamburg"],
		Hesse: [
			"Darmstadt",
			"Frankfurt",
			"Fulda",
			"Gießen",
			"Kassel",
			"Marburg",
			"Offenbach",
			"Wiesbaden",
		],
		"Lower Saxony": [
			"Braunschweig",
			"Celle",
			"Emden",
			"Göttingen",
			"Hanover",
			"Hildesheim",
			"Lüneburg",
			"Oldenburg",
			"Osnabrück",
			"Salzgitter",
			"Wolfsburg",
		],
		"Mecklenburg-Vorpommern": ["Rostock", "Schwerin", "Stralsund"],
		"North Rhine-Westphalia": [
			"Aachen",
			"Bielefeld",
			"Bochum",
			"Bonn",
			"Bottrop",
			"Cologne",
			"Dortmund",
			"Duisburg",
			"Düsseldorf",
			"Essen",
			"Gelsenkirchen",
			"Hagen",
			"Hamm",
			"Krefeld",
			"Leverkusen",
			"Mönchengladbach",
			"Münster",
			"Oberhausen",
			"Paderborn",
			"Recklinghausen",
			"Remscheid",
			"Siegen",
			"Solingen",
			"Wuppertal",
		],
		"Rhineland-Palatinate": ["Koblenz", "Ludwigshafen", "Mainz", "Trier"],
		Saarland: ["Saarbrücken"],
		Saxony: ["Chemnitz", "Dresden", "Leipzig", "Zwickau"],
		"Saxony-Anhalt": ["Dessau", "Halle", "Magdeburg"],
		"Schleswig-Holstein": ["Flensburg", "Kiel", "Lübeck", "Neumünster"],
		Thuringia: ["Erfurt", "Gera", "Jena", "Weimar"],
	},
	France: {
		"Île-de-France": [
			"Paris",
			"Versailles",
			"Boulogne-Billancourt",
			"Montreuil",
			"Saint-Denis",
			"Nanterre",
			"Créteil",
		],
		"Auvergne-Rhône-Alpes": [
			"Lyon",
			"Grenoble",
			"Saint-Étienne",
			"Villeurbanne",
			"Clermont-Ferrand",
			"Annecy",
			"Chambéry",
		],
		"Provence-Alpes-Côte d'Azur": [
			"Marseille",
			"Nice",
			"Toulon",
			"Aix-en-Provence",
			"Avignon",
			"Cannes",
			"Antibes",
		],
		Occitanie: [
			"Toulouse",
			"Montpellier",
			"Nîmes",
			"Perpignan",
			"Béziers",
			"Narbonne",
		],
		"Nouvelle-Aquitaine": [
			"Bordeaux",
			"Limoges",
			"Poitiers",
			"La Rochelle",
			"Pau",
			"Bayonne",
		],
		"Grand Est": ["Strasbourg", "Reims", "Metz", "Nancy", "Mulhouse", "Colmar"],
		"Hauts-de-France": [
			"Lille",
			"Amiens",
			"Roubaix",
			"Tourcoing",
			"Dunkirk",
			"Calais",
		],
		Normandy: ["Rouen", "Le Havre", "Caen", "Cherbourg"],
		Brittany: ["Rennes", "Brest", "Quimper", "Lorient", "Saint-Malo"],
		"Pays de la Loire": ["Nantes", "Angers", "Le Mans", "Saint-Nazaire"],
		"Centre-Val de Loire": ["Orléans", "Tours", "Bourges", "Blois"],
		Bourgogne: ["Dijon", "Chalon-sur-Saône", "Mâcon", "Auxerre"],
		Corsica: ["Ajaccio", "Bastia"],
	},
	Italy: {
		Lazio: ["Rome", "Latina", "Frosinone", "Viterbo"],
		Lombardy: ["Milan", "Brescia", "Bergamo", "Monza", "Como", "Varese"],
		Campania: ["Naples", "Salerno", "Caserta"],
		Sicily: ["Palermo", "Catania", "Messina", "Siracusa"],
		Veneto: ["Venice", "Verona", "Padua", "Vicenza", "Treviso"],
		Piedmont: ["Turin", "Alessandria", "Asti", "Cuneo", "Novara"],
		"Emilia-Romagna": [
			"Bologna",
			"Parma",
			"Modena",
			"Reggio Emilia",
			"Ravenna",
		],
		Tuscany: ["Florence", "Pisa", "Livorno", "Arezzo", "Siena", "Lucca"],
		Apulia: ["Bari", "Taranto", "Foggia", "Lecce", "Brindisi"],
		Calabria: ["Reggio Calabria", "Catanzaro", "Cosenza"],
		Sardinia: ["Cagliari", "Sassari", "Olbia"],
		Liguria: ["Genoa", "La Spezia", "Savona"],
		"Trentino-Alto Adige": ["Trento", "Bolzano"],
		"Friuli-Venezia Giulia": ["Trieste", "Udine"],
		Marche: ["Ancona", "Pesaro"],
		Abruzzo: ["Pescara", "L'Aquila"],
		Umbria: ["Perugia", "Terni"],
		Basilicata: ["Potenza"],
		Molise: ["Campobasso"],
	},
	Spain: {
		Madrid: ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada"],
		Catalonia: ["Barcelona", "Hospitalet", "Badalona", "Tarragona", "Sabadell"],
		Andalusia: ["Seville", "Málaga", "Córdoba", "Granada", "Jerez", "Almería"],
		"Valencian Community": ["Valencia", "Alicante", "Elche", "Castellón"],
		Galicia: ["A Coruña", "Vigo", "Santiago de Compostela", "Ourense"],
		"Basque Country": ["Bilbao", "Vitoria-Gasteiz", "Donostia-San Sebastián"],
		Asturias: ["Oviedo", "Gijón"],
		Aragon: ["Zaragoza"],
		"Castile and León": ["Valladolid", "Burgos", "Salamanca", "León"],
		Murcia: ["Murcia", "Cartagena"],
		"Balearic Islands": ["Palma"],
		"Canary Islands": ["Las Palmas", "Santa Cruz de Tenerife"],
		Navarre: ["Pamplona"],
		Extremadura: ["Badajoz"],
		Cantabria: ["Santander"],
		"La Rioja": ["Logroño"],
	},
	Japan: {
		Hokkaido: ["Sapporo", "Hakodate", "Asahikawa", "Otaru"],
		Tohoku: [
			"Sendai",
			"Aomori",
			"Akita",
			"Fukushima",
			"Koriyama",
			"Morioka",
			"Yamagata",
		],
		Kanto: [
			"Tokyo",
			"Yokohama",
			"Kawasaki",
			"Saitama",
			"Chiba",
			"Sagamihara",
			"Funabashi",
			"Hachioji",
			"Kawaguchi",
			"Matsudo",
			"Ichikawa",
			"Utsunomiya",
			"Maebashi",
			"Takasaki",
			"Mito",
			"Kawagoe",
			"Yokosuka",
		],
		Chubu: [
			"Nagoya",
			"Hamamatsu",
			"Shizuoka",
			"Niigata",
			"Kanazawa",
			"Gifu",
			"Toyama",
			"Nagano",
			"Fukui",
		],
		Kansai: [
			"Osaka",
			"Kobe",
			"Kyoto",
			"Sakai",
			"Nara",
			"Himeji",
			"Wakayama",
			"Otsu",
		],
		Chugoku: [
			"Hiroshima",
			"Okayama",
			"Kurashiki",
			"Fukuyama",
			"Matsue",
			"Yamaguchi",
		],
		Shikoku: ["Matsuyama", "Takamatsu", "Kochi", "Tokushima"],
		Kyushu: [
			"Fukuoka",
			"Kitakyushu",
			"Kumamoto",
			"Kagoshima",
			"Nagasaki",
			"Oita",
			"Miyazaki",
			"Saga",
		],
		Okinawa: ["Naha", "Okinawa City", "Urasoe", "Ginowan"],
	},
	China: {
		Beijing: ["Beijing"],
		Shanghai: ["Shanghai"],
		Guangdong: [
			"Guangzhou",
			"Shenzhen",
			"Dongguan",
			"Foshan",
			"Zhongshan",
			"Zhuhai",
			"Shantou",
			"Jiangmen",
		],
		Sichuan: ["Chengdu", "Mianyang", "Deyang", "Nanchong"],
		Jiangsu: ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong", "Yangzhou"],
		Zhejiang: ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing", "Jinhua"],
		Shandong: ["Jinan", "Qingdao", "Zibo", "Yantai", "Weifang", "Linyi"],
		Henan: ["Zhengzhou", "Luoyang", "Kaifeng", "Anyang", "Xinxiang"],
		Hubei: ["Wuhan", "Yichang", "Xiangyang"],
		Liaoning: ["Shenyang", "Dalian", "Anshan", "Fushun"],
		Hebei: ["Shijiazhuang", "Tangshan", "Baoding", "Handan", "Qinhuangdao"],
		Shaanxi: ["Xi'an", "Baoji", "Xianyang"],
		Anhui: ["Hefei", "Wuhu", "Bengbu", "Anqing"],
		Hunan: ["Changsha", "Zhuzhou", "Xiangtan", "Hengyang"],
		Fujian: ["Fuzhou", "Xiamen", "Quanzhou", "Zhangzhou"],
		Jiangxi: ["Nanchang", "Ganzhou", "Jingdezhen"],
		Shanxi: ["Taiyuan", "Datong"],
		Heilongjiang: ["Harbin", "Qiqihar", "Daqing"],
		Jilin: ["Changchun", "Jilin City"],
		Gansu: ["Lanzhou"],
		Yunnan: ["Kunming", "Qujing"],
		Chongqing: ["Chongqing"],
		Tianjin: ["Tianjin"],
		"Inner Mongolia": ["Hohhot", "Baotou"],
		Guangxi: ["Nanning", "Liuzhou", "Guilin"],
		Guizhou: ["Guiyang", "Zunyi"],
		Hainan: ["Haikou", "Sanya"],
		Ningxia: ["Yinchuan"],
		Qinghai: ["Xining"],
		Tibet: ["Lhasa"],
		Xinjiang: ["Ürümqi"],
	},
	India: {
		Maharashtra: [
			"Mumbai",
			"Pune",
			"Nagpur",
			"Nashik",
			"Aurangabad",
			"Solapur",
		],
		"Delhi NCT": ["New Delhi", "Delhi"],
		Karnataka: ["Bangalore", "Mysore", "Mangalore", "Hubli"],
		"Tamil Nadu": [
			"Chennai",
			"Coimbatore",
			"Madurai",
			"Tiruchirappalli",
			"Salem",
		],
		"Uttar Pradesh": [
			"Lucknow",
			"Kanpur",
			"Agra",
			"Varanasi",
			"Meerut",
			"Allahabad",
		],
		"West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol"],
		Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
		Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
		Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
		Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
		Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
		Haryana: ["Faridabad", "Gurgaon", "Panipat", "Ambala"],
		Bihar: ["Patna", "Gaya", "Bhagalpur"],
		"Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
		Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
		Assam: ["Guwahati", "Silchar", "Dibrugarh"],
		Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
		Chhattisgarh: ["Raipur", "Bhilai"],
		Uttarakhand: ["Dehradun", "Haridwar"],
		Goa: ["Panaji", "Vasco da Gama"],
		"Himachal Pradesh": ["Shimla", "Dharamshala"],
		Jammu: ["Jammu", "Srinagar"],
		Meghalaya: ["Shillong"],
		Tripura: ["Agartala"],
		Manipur: ["Imphal"],
		Nagaland: ["Kohima"],
		Mizoram: ["Aizawl"],
		Sikkim: ["Gangtok"],
		Puducherry: ["Puducherry"],
	},
	Brazil: {
		"São Paulo": [
			"São Paulo",
			"Campinas",
			"São Bernardo do Campo",
			"Santo André",
			"Osasco",
			"Ribeirão Preto",
			"Sorocaba",
		],
		"Rio de Janeiro": [
			"Rio de Janeiro",
			"Niterói",
			"Duque de Caxias",
			"Nova Iguaçu",
		],
		"Minas Gerais": [
			"Belo Horizonte",
			"Uberlândia",
			"Contagem",
			"Juiz de Fora",
		],
		Bahia: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
		Paraná: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"],
		"Rio Grande do Sul": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas"],
		Pernambuco: ["Recife", "Jaboatão dos Guararapes", "Olinda"],
		Ceará: ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
		Pará: ["Belém", "Ananindeua", "Santarém"],
		"Santa Catarina": ["Florianópolis", "Joinville", "Blumenau"],
		Goiás: ["Goiânia", "Aparecida de Goiânia"],
		Maranhão: ["São Luís", "Imperatriz"],
		Amazonas: ["Manaus"],
		"Espírito Santo": ["Vila Velha", "Serra", "Vitória"],
		Paraíba: ["João Pessoa", "Campina Grande"],
		"Rio Grande do Norte": ["Natal", "Mossoró"],
		Alagoas: ["Maceió"],
		Piauí: ["Teresina"],
		"Mato Grosso": ["Cuiabá", "Várzea Grande"],
		"Mato Grosso do Sul": ["Campo Grande", "Dourados"],
		"Distrito Federal": ["Brasília"],
	},
	Mexico: {
		"Mexico City": ["Mexico City"],
		Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque"],
		"Nuevo León": ["Monterrey", "San Pedro Garza García", "Apodaca"],
		Puebla: ["Puebla", "Tehuacán"],
		Guanajuato: ["León", "Irapuato", "Celaya", "Salamanca"],
		Chihuahua: ["Chihuahua", "Juárez"],
		Veracruz: ["Veracruz", "Xalapa", "Coatzacoalcos"],
		"Baja California": ["Tijuana", "Mexicali", "Ensenada"],
		Tamaulipas: ["Reynosa", "Matamoros", "Tampico"],
		Coahuila: ["Torreón", "Saltillo", "Monclova"],
		Sonora: ["Hermosillo", "Cd. Obregón"],
		Sinaloa: ["Culiacán", "Mazatlán"],
		Querétaro: ["Querétaro", "San Juan del Río"],
		"San Luis Potosí": ["San Luis Potosí", "Soledad de Graciano Sánchez"],
		Yucatán: ["Mérida"],
		Aguascalientes: ["Aguascalientes"],
		Morelos: ["Cuernavaca", "Jiutepec"],
		Durango: ["Durango"],
		Zacatecas: ["Zacatecas"],
		Quintana: ["Cancún", "Playa del Carmen", "Chetumal"],
	},
	Argentina: {
		"Buenos Aires": [
			"Buenos Aires",
			"La Plata",
			"Mar del Plata",
			"Bahía Blanca",
			"Quilmes",
		],
		Córdoba: ["Córdoba", "Río Cuarto", "Villa María"],
		"Santa Fe": ["Rosario", "Santa Fe", "Rafaela"],
		Mendoza: ["Mendoza", "San Rafael"],
		Tucumán: ["San Miguel de Tucumán"],
		Salta: ["Salta"],
		"Entre Ríos": ["Paraná", "Concordia"],
		Misiones: ["Posadas"],
		Chaco: ["Resistencia"],
		Corrientes: ["Corrientes"],
		Santiago: ["Santiago del Estero"],
		"San Juan": ["San Juan"],
		Jujuy: ["San Salvador de Jujuy"],
		"Río Negro": ["Neuquén", "Bariloche"],
		Formosa: ["Formosa"],
		Chubut: ["Comodoro Rivadavia"],
		"San Luis": ["San Luis"],
		Catamarca: ["Catamarca"],
		"La Rioja": ["La Rioja"],
		"La Pampa": ["Santa Rosa"],
		"Santa Cruz": ["Río Gallegos"],
		"Tierra del Fuego": ["Ushuaia"],
	},
	Colombia: {
		Bogotá: ["Bogotá"],
		Antioquia: ["Medellín", "Bello", "Itagüí"],
		"Valle del Cauca": ["Cali", "Palmira", "Buenaventura"],
		Atlántico: ["Barranquilla", "Soledad"],
		Santander: ["Bucaramanga", "Floridablanca"],
		Bolívar: ["Cartagena"],
		Cundinamarca: ["Soacha", "Facatativá"],
		Norte: ["Cúcuta"],
		Tolima: ["Ibagué"],
		Risaralda: ["Pereira", "Dosquebradas"],
		Caldas: ["Manizales"],
		Huila: ["Neiva"],
		Meta: ["Villavicencio"],
		Cauca: ["Popayán"],
		Nariño: ["Pasto"],
		Magdalena: ["Santa Marta"],
		Quindío: ["Armenia"],
		Boyacá: ["Tunja"],
		Córdoba: ["Montería"],
		Sucre: ["Sincelejo"],
	},
	Chile: {
		Santiago: ["Santiago", "Puente Alto", "Maipú", "La Florida"],
		Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué"],
		"Bío Bío": ["Concepción", "Talcahuano", "Los Ángeles"],
		Araucanía: ["Temuco"],
		"Los Lagos": ["Puerto Montt", "Osorno"],
		Maule: ["Talca", "Curicó"],
		Antofagasta: ["Antofagasta", "Calama"],
		Coquimbo: ["La Serena", "Coquimbo"],
		"O'Higgins": ["Rancagua"],
		Tarapacá: ["Iquique"],
		Aysén: ["Coyhaique"],
		Magallanes: ["Punta Arenas"],
	},
	Peru: {
		Lima: ["Lima", "Callao"],
		Arequipa: ["Arequipa"],
		"La Libertad": ["Trujillo"],
		Lambayeque: ["Chiclayo"],
		Piura: ["Piura"],
		Cusco: ["Cusco"],
		Junín: ["Huancayo"],
		Loreto: ["Iquitos"],
		Puno: ["Juliaca", "Puno"],
		Ica: ["Ica"],
		Ancash: ["Chimbote"],
		Tacna: ["Tacna"],
	},
	Indonesia: {
		Jakarta: ["Jakarta"],
		"West Java": ["Bandung", "Bekasi", "Depok", "Bogor", "Cirebon"],
		"East Java": ["Surabaya", "Malang", "Semarang"],
		"Central Java": ["Yogyakarta", "Solo", "Salatiga"],
		Banten: ["Tangerang", "South Tangerang", "Serang"],
		"North Sumatra": ["Medan", "Binjai"],
		"South Sumatra": ["Palembang"],
		Riau: ["Pekanbaru"],
		"South Sulawesi": ["Makassar"],
		Bali: ["Denpasar"],
		"East Kalimantan": ["Balikpapan", "Samarinda"],
		Aceh: ["Banda Aceh"],
	},
	"Saudi Arabia": {
		Riyadh: ["Riyadh"],
		Makkah: ["Jeddah", "Mecca", "Taif"],
		"Eastern Province": ["Dammam", "Khobar", "Dhahran"],
		Madinah: ["Medina"],
		"Al-Qassim": ["Buraydah"],
		Asir: ["Abha"],
		Tabuk: ["Tabuk"],
		Hail: ["Hail"],
		Jizan: ["Jizan"],
		Najran: ["Najran"],
	},
	"United Arab Emirates": {
		Dubai: ["Dubai"],
		"Abu Dhabi": ["Abu Dhabi", "Al Ain"],
		Sharjah: ["Sharjah"],
		Ajman: ["Ajman"],
		"Ras Al Khaimah": ["Ras Al Khaimah"],
		Fujairah: ["Fujairah"],
		"Umm Al Quwain": ["Umm Al Quwain"],
	},
	Sweden: {
		Stockholm: ["Stockholm", "Solna", "Södertälje"],
		"Västra Götaland": ["Gothenburg", "Borås", "Mölndal"],
		Skåne: ["Malmö", "Helsingborg", "Lund"],
		Uppsala: ["Uppsala"],
		Östergötland: ["Linköping", "Norrköping"],
		Västerbotten: ["Umeå"],
		Gävleborg: ["Gävle"],
		Örebro: ["Örebro"],
		Jönköping: ["Jönköping"],
		Halland: ["Halmstad"],
		Västmanland: ["Västerås"],
		Dalarna: ["Falun"],
		Södermanland: ["Eskilstuna"],
		Norrbotten: ["Luleå"],
	},
	Norway: {
		Oslo: ["Oslo"],
		Viken: ["Drammen", "Fredrikstad", "Sarpsborg"],
		Vestland: ["Bergen", "Stavanger"],
		Trøndelag: ["Trondheim"],
		Rogaland: ["Sandnes", "Haugesund"],
		Agder: ["Kristiansand", "Arendal"],
		Nordland: ["Bodø"],
		Innlandet: ["Lillehammer", "Hamar"],
		Møre: ["Ålesund", "Molde"],
		Vestfold: ["Tønsberg", "Sandefjord"],
		Troms: ["Tromsø"],
	},
	Denmark: {
		"Capital Region": ["Copenhagen", "Frederiksberg"],
		"Central Denmark": ["Aarhus", "Randers", "Viborg"],
		"Southern Denmark": ["Odense", "Esbjerg", "Kolding"],
		"North Denmark": ["Aalborg"],
		Zealand: ["Roskilde", "Helsingør"],
	},
	Finland: {
		Uusimaa: ["Helsinki", "Espoo", "Vantaa"],
		Pirkanmaa: ["Tampere"],
		"Southwest Finland": ["Turku"],
		"North Ostrobothnia": ["Oulu"],
		"Central Finland": ["Jyväskylä"],
		Lapland: ["Rovaniemi"],
		Päijänne: ["Lahti"],
		Kainuu: ["Kajaani"],
	},
	Austria: {
		Vienna: ["Vienna"],
		"Lower Austria": ["St. Pölten", "Wiener Neustadt"],
		"Upper Austria": ["Linz", "Wels"],
		Styria: ["Graz"],
		Tyrol: ["Innsbruck"],
		Carinthia: ["Klagenfurt"],
		Salzburg: ["Salzburg"],
		Vorarlberg: ["Dornbirn", "Feldkirch"],
		Burgenland: ["Eisenstadt"],
	},
	Switzerland: {
		Zürich: ["Zürich", "Winterthur"],
		Geneva: ["Geneva"],
		Basel: ["Basel"],
		Bern: ["Bern"],
		Vaud: ["Lausanne"],
		Lucerne: ["Lucerne"],
		"St. Gallen": ["St. Gallen"],
		Ticino: ["Lugano"],
		Aargau: ["Aarau"],
	},
	Belgium: {
		Brussels: ["Brussels"],
		Antwerp: ["Antwerp", "Mechelen"],
		"East Flanders": ["Ghent", "Aalst"],
		"West Flanders": ["Bruges", "Kortrijk"],
		Limburg: ["Hasselt", "Genk"],
		"Flemish Brabant": ["Leuven"],
		Liège: ["Liège", "Verviers"],
		Hainaut: ["Charleroi", "Mons"],
		Namur: ["Namur"],
		Luxembourg: ["Arlon"],
		"Walloon Brabant": ["Wavre"],
	},
	Portugal: {
		Lisbon: ["Lisbon", "Amadora", "Cascais"],
		Porto: ["Porto", "Vila Nova de Gaia", "Matosinhos"],
		Braga: ["Braga", "Guimarães"],
		Setúbal: ["Almada", "Setúbal"],
		Coimbra: ["Coimbra"],
		Aveiro: ["Aveiro"],
		Faro: ["Faro"],
		Leiria: ["Leiria"],
		Viseu: ["Viseu"],
		Madeira: ["Funchal"],
		Azores: ["Ponta Delgada"],
	},
	Greece: {
		Attica: ["Athens", "Piraeus"],
		"Central Macedonia": ["Thessaloniki"],
		Crete: ["Heraklion", "Chania"],
		"Western Greece": ["Patras"],
		"Central Greece": ["Larissa"],
		Peloponnese: ["Kalamata"],
		"Eastern Macedonia": ["Kavala"],
		Epirus: ["Ioannina"],
		Thessaly: ["Volos"],
		"South Aegean": ["Rhodes"],
	},
	"Czech Republic": {
		Prague: ["Prague"],
		"South Moravian": ["Brno"],
		Moravian: ["Ostrava"],
		Pilsen: ["Plzeň"],
		"Ústí nad Labem": ["Ústí nad Labem"],
		Liberec: ["Liberec"],
		Hradec: ["Hradec Králové"],
		Pardubice: ["Pardubice"],
		Olomouc: ["Olomouc"],
		Zlín: ["Zlín"],
	},
	Hungary: {
		Budapest: ["Budapest"],
		Pest: ["Érd", "Dunaújváros"],
		Bács: ["Szeged", "Kecskemét"],
		Hajdú: ["Debrecen"],
		Borsod: ["Miskolc"],
		Csongrád: ["Hódmezővásárhely"],
		Győr: ["Győr"],
		Szabolcs: ["Nyíregyháza"],
		Veszprém: ["Veszprém"],
		Baranya: ["Pécs"],
	},
	Romania: {
		Bucharest: ["Bucharest"],
		Cluj: ["Cluj-Napoca"],
		Timiș: ["Timișoara"],
		Iași: ["Iași"],
		Constanța: ["Constanța"],
		Brașov: ["Brașov"],
		Galați: ["Galați"],
		Prahova: ["Ploiești"],
		Dolj: ["Craiova"],
		Bihor: ["Oradea"],
	},
	Ukraine: {
		Kyiv: ["Kyiv"],
		Kharkiv: ["Kharkiv"],
		Odesa: ["Odesa"],
		Dnipropetrovsk: ["Dnipro"],
		Donetsk: ["Donetsk"],
		Lviv: ["Lviv"],
		Zaporizhzhia: ["Zaporizhzhia"],
		Kryvyi: ["Kryvyi Rih"],
		Mykolaiv: ["Mykolaiv"],
		Luhansk: ["Luhansk"],
	},
	Ireland: {
		Leinster: ["Dublin", "Drogheda", "Dundalk", "Swords"],
		Munster: ["Cork", "Limerick", "Waterford"],
		Connacht: ["Galway"],
		Ulster: ["Letterkenny"],
	},
	Singapore: {
		Singapore: [
			"Singapore",
			"Jurong",
			"Woodlands",
			"Tampines",
			"Bedok",
			"Hougang",
		],
	},
	"Hong Kong": {
		"Hong Kong": [
			"Central",
			"Kowloon",
			"Tsim Sha Tsui",
			"Causeway Bay",
			"Mong Kok",
		],
	},
	Taiwan: {
		Taipei: ["Taipei", "New Taipei"],
		Kaohsiung: ["Kaohsiung"],
		Taichung: ["Taichung"],
		Tainan: ["Tainan"],
		Taoyuan: ["Taoyuan"],
		Hsinchu: ["Hsinchu"],
	},
	Bangladesh: {
		Dhaka: ["Dhaka", "Narayanganj"],
		Chittagong: ["Chittagong"],
		Khulna: ["Khulna"],
		Rajshahi: ["Rajshahi"],
		Sylhet: ["Sylhet"],
		Rangpur: ["Rangpur"],
		Barisal: ["Barisal"],
		Mymensingh: ["Mymensingh"],
	},
	Pakistan: {
		Punjab: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala"],
		Sindh: ["Karachi", "Hyderabad", "Sukkur"],
		Khyber: ["Peshawar", "Mardan"],
		Balochistan: ["Quetta"],
		Islamabad: ["Islamabad"],
	},
	Kenya: {
		Nairobi: ["Nairobi"],
		Mombasa: ["Mombasa"],
		Kisumu: ["Kisumu"],
		Nakuru: ["Nakuru"],
		Eldoret: ["Eldoret"],
		Ruiru: ["Ruiru"],
		Kikuyu: ["Kikuyu"],
	},
	Morocco: {
		Casablanca: ["Casablanca"],
		Rabat: ["Rabat", "Salé"],
		Fès: ["Fès"],
		Marrakesh: ["Marrakesh"],
		Tangier: ["Tangier"],
		Agadir: ["Agadir"],
		Meknès: ["Meknès"],
		Oujda: ["Oujda"],
	},
	Algeria: {
		Algiers: ["Algiers"],
		Oran: ["Oran"],
		Constantine: ["Constantine"],
		Annaba: ["Annaba"],
		Blida: ["Blida"],
		Batna: ["Batna"],
		Sétif: ["Sétif"],
	},
	Ghana: {
		"Greater Accra": ["Accra", "Tema"],
		Ashanti: ["Kumasi"],
		Western: ["Sekondi-Takoradi"],
		Eastern: ["Koforidua"],
		Northern: ["Tamale"],
		Central: ["Cape Coast"],
	},
	Ethiopia: {
		"Addis Ababa": ["Addis Ababa"],
		Oromia: ["Adama", "Bishoftu"],
		Amhara: ["Bahir Dar", "Gondar"],
		Tigray: ["Mekelle"],
		"Southern Nations": ["Hawassa"],
		Dire: ["Dire Dawa"],
	},
	Israel: {
		"Tel Aviv": ["Tel Aviv", "Holon", "Bat Yam", "Ramat Gan"],
		Jerusalem: ["Jerusalem"],
		Haifa: ["Haifa"],
		Central: ["Rishon LeZion", "Petah Tikva", "Netanya"],
		Southern: ["Beersheba", "Ashdod", "Ashkelon"],
		Northern: ["Nazareth"],
	},
	// Additional countries A-E
	Afghanistan: {
		Kabul: ["Kabul"],
		Herat: ["Herat"],
		Kandahar: ["Kandahar"],
		Balkh: ["Mazar-i-Sharif"],
		Nangarhar: ["Jalalabad"],
	},
	Albania: {
		Tirana: ["Tirana"],
		Durrës: ["Durrës"],
		Vlorë: ["Vlorë"],
		Shkodër: ["Shkodër"],
		Elbasan: ["Elbasan"],
	},
	Andorra: {
		"Andorra la Vella": ["Andorra la Vella", "Escaldes-Engordany"],
	},
	Angola: {
		Luanda: ["Luanda"],
		Huambo: ["Huambo"],
		Benguela: ["Benguela"],
		Lubango: ["Lubango"],
		Kuito: ["Kuito"],
	},
	"Antigua and Barbuda": {
		"Saint John": ["St. John's"],
	},
	Armenia: {
		Yerevan: ["Yerevan"],
		Gyumri: ["Gyumri"],
		Vanadzor: ["Vanadzor"],
	},
	Azerbaijan: {
		Baku: ["Baku"],
		Ganja: ["Ganja"],
		Sumqayit: ["Sumqayit"],
		Mingachevir: ["Mingachevir"],
	},
	Bahamas: {
		"New Providence": ["Nassau"],
		"Grand Bahama": ["Freeport"],
	},
	Bahrain: {
		Capital: ["Manama"],
		Muharraq: ["Muharraq"],
		Northern: ["Riffa"],
	},
	Barbados: {
		"Saint Michael": ["Bridgetown"],
		"Christ Church": ["Oistins"],
	},
	Belarus: {
		Minsk: ["Minsk"],
		Gomel: ["Gomel"],
		Mogilev: ["Mogilev"],
		Vitebsk: ["Vitebsk"],
		Grodno: ["Grodno"],
		Brest: ["Brest"],
	},
	Belize: {
		Belize: ["Belize City"],
		Cayo: ["San Ignacio"],
		"Orange Walk": ["Orange Walk"],
	},
	Benin: {
		Littoral: ["Cotonou"],
		Atlantique: ["Porto-Novo"],
		Ouémé: ["Parakou"],
	},
	Bhutan: {
		Thimphu: ["Thimphu"],
		Paro: ["Paro"],
		Punakha: ["Punakha"],
	},
	Bolivia: {
		"La Paz": ["La Paz", "El Alto"],
		"Santa Cruz": ["Santa Cruz de la Sierra"],
		Cochabamba: ["Cochabamba"],
		Oruro: ["Oruro"],
		Sucre: ["Sucre"],
	},
	"Bosnia and Herzegovina": {
		"Federation of Bosnia and Herzegovina": ["Sarajevo", "Mostar", "Tuzla"],
		"Republika Srpska": ["Banja Luka", "Bijeljina"],
	},
	Botswana: {
		"South-East": ["Gaborone"],
		"North-West": ["Maun"],
		Central: ["Francistown"],
	},
	"Brunei Darussalam": {
		"Brunei-Muara": ["Bandar Seri Begawan"],
		Belait: ["Kuala Belait"],
		Tutong: ["Tutong"],
	},
	Bulgaria: {
		Sofia: ["Sofia"],
		Plovdiv: ["Plovdiv"],
		Varna: ["Varna"],
		Burgas: ["Burgas"],
		Ruse: ["Ruse"],
	},
	"Burkina Faso": {
		Centre: ["Ouagadougou"],
		Hauts: ["Bobo-Dioulasso"],
	},
	Burundi: {
		Bujumbura: ["Bujumbura"],
		Gitega: ["Gitega"],
	},
	"Cabo Verde": {
		Santiago: ["Praia"],
		"São Vicente": ["Mindelo"],
	},
	Cambodia: {
		"Phnom Penh": ["Phnom Penh"],
		"Siem Reap": ["Siem Reap"],
		Battambang: ["Battambang"],
	},
	Cameroon: {
		Centre: ["Yaoundé"],
		Littoral: ["Douala"],
		Ouest: ["Bafoussam"],
	},
	"Central African Republic": {
		Bangui: ["Bangui"],
		Ouham: ["Bossangoa"],
	},
	Chad: {
		"N'Djamena": ["N'Djamena"],
		Logone: ["Moundou"],
	},
	Comoros: {
		"Grande Comore": ["Moroni"],
		Anjouan: ["Mutsamudu"],
	},
	Congo: {
		Brazzaville: ["Brazzaville"],
		Pointe: ["Pointe-Noire"],
	},
	"Costa Rica": {
		"San José": ["San José"],
		Alajuela: ["Alajuela"],
		Cartago: ["Cartago"],
		Heredia: ["Heredia"],
		Guanacaste: ["Liberia"],
	},
	"Côte d'Ivoire": {
		Abidjan: ["Abidjan"],
		Yamoussoukro: ["Yamoussoukro"],
		Bouaké: ["Bouaké"],
	},
	Croatia: {
		Zagreb: ["Zagreb"],
		Split: ["Split"],
		Rijeka: ["Rijeka"],
		Osijek: ["Osijek"],
	},
	Cuba: {
		Havana: ["Havana"],
		Santiago: ["Santiago de Cuba"],
		Camagüey: ["Camagüey"],
		Holguín: ["Holguín"],
	},
	Cyprus: {
		Nicosia: ["Nicosia"],
		Limassol: ["Limassol"],
		Larnaca: ["Larnaca"],
		Paphos: ["Paphos"],
	},
	"Democratic Republic of the Congo": {
		Kinshasa: ["Kinshasa"],
		Lubumbashi: ["Lubumbashi"],
		Mbuji: ["Mbuji-Mayi"],
		Kananga: ["Kananga"],
	},
	Djibouti: {
		Djibouti: ["Djibouti City"],
	},
	Dominica: {
		"Saint George": ["Roseau"],
	},
	"Dominican Republic": {
		"Santo Domingo": ["Santo Domingo"],
		Santiago: ["Santiago de los Caballeros"],
		"La Vega": ["La Vega"],
	},
	Ecuador: {
		Pichincha: ["Quito"],
		Guayas: ["Guayaquil"],
		Azuay: ["Cuenca"],
		Manabí: ["Portoviejo"],
	},
	"El Salvador": {
		"San Salvador": ["San Salvador"],
		"Santa Ana": ["Santa Ana"],
		"San Miguel": ["San Miguel"],
	},
	"Equatorial Guinea": {
		Bioko: ["Malabo"],
		Litoral: ["Bata"],
	},
	Eritrea: {
		Maekel: ["Asmara"],
		Debub: ["Mendefera"],
	},
	Estonia: {
		Harju: ["Tallinn"],
		Tartu: ["Tartu"],
		Ida: ["Narva"],
	},
	Eswatini: {
		Hhohho: ["Mbabane"],
		Manzini: ["Manzini"],
	},
	// F-M countries
	Fiji: {
		Central: ["Suva"],
		Western: ["Lautoka", "Nadi"],
	},
	Gabon: {
		Estuaire: ["Libreville"],
		"Haut-Ogooué": ["Franceville"],
	},
	Gambia: {
		Banjul: ["Banjul"],
		Kanifing: ["Serekunda"],
	},
	Georgia: {
		Tbilisi: ["Tbilisi"],
		Adjara: ["Batumi"],
		Imereti: ["Kutaisi"],
	},
	Grenada: {
		"Saint George": ["St. George's"],
	},
	Guatemala: {
		Guatemala: ["Guatemala City"],
		Quetzaltenango: ["Quetzaltenango"],
		Escuintla: ["Escuintla"],
	},
	Guinea: {
		Conakry: ["Conakry"],
		Kindia: ["Kindia"],
	},
	"Guinea-Bissau": {
		Bissau: ["Bissau"],
	},
	Guyana: {
		Demerara: ["Georgetown"],
	},
	Haiti: {
		Ouest: ["Port-au-Prince"],
		Nord: ["Cap-Haïtien"],
	},
	Honduras: {
		"Francisco Morazán": ["Tegucigalpa"],
		Cortés: ["San Pedro Sula"],
	},
	Iceland: {
		"Capital Region": ["Reykjavik"],
	},
	Iran: {
		Tehran: ["Tehran"],
		Mashhad: ["Mashhad"],
		Isfahan: ["Isfahan"],
		Karaj: ["Karaj"],
		Shiraz: ["Shiraz"],
		Tabriz: ["Tabriz"],
	},
	Iraq: {
		Baghdad: ["Baghdad"],
		Basra: ["Basra"],
		Mosul: ["Mosul"],
		Erbil: ["Erbil"],
	},
	Jamaica: {
		Kingston: ["Kingston"],
		"Saint Andrew": ["Portmore"],
		"Saint Catherine": ["Spanish Town"],
	},
	Jordan: {
		Amman: ["Amman"],
		Zarqa: ["Zarqa"],
		Irbid: ["Irbid"],
	},
	Kazakhstan: {
		Almaty: ["Almaty"],
		Astana: ["Astana"],
		Shymkent: ["Shymkent"],
		Karaganda: ["Karaganda"],
	},
	Kiribati: {
		Tarawa: ["South Tarawa"],
	},
	Kuwait: {
		"Al Asimah": ["Kuwait City"],
		Hawalli: ["Hawalli"],
	},
	Kyrgyzstan: {
		Bishkek: ["Bishkek"],
		Osh: ["Osh"],
	},
	Laos: {
		Vientiane: ["Vientiane"],
		Luang: ["Luang Prabang"],
	},
	Latvia: {
		Riga: ["Riga"],
		Daugavpils: ["Daugavpils"],
	},
	Lebanon: {
		Beirut: ["Beirut"],
		Mount: ["Tripoli"],
	},
	Lesotho: {
		Maseru: ["Maseru"],
	},
	Liberia: {
		Montserrado: ["Monrovia"],
	},
	Libya: {
		Tripoli: ["Tripoli"],
		Benghazi: ["Benghazi"],
	},
	Liechtenstein: {
		Oberland: ["Vaduz"],
	},
	Lithuania: {
		Vilnius: ["Vilnius"],
		Kaunas: ["Kaunas"],
	},
	Luxembourg: {
		Luxembourg: ["Luxembourg City"],
	},
	Madagascar: {
		Analamanga: ["Antananarivo"],
		Atsinanana: ["Toamasina"],
	},
	Malawi: {
		Central: ["Lilongwe"],
		Southern: ["Blantyre"],
	},
	Maldives: {
		Malé: ["Malé"],
	},
	Mali: {
		Bamako: ["Bamako"],
		Sikasso: ["Sikasso"],
	},
	Malta: {
		Southern: ["Valletta"],
		Northern: ["Sliema"],
	},
	"Marshall Islands": {
		Majuro: ["Majuro"],
	},
	Mauritania: {
		Nouakchott: ["Nouakchott"],
	},
	Mauritius: {
		Port: ["Port Louis"],
		Curepipe: ["Curepipe"],
	},
	Micronesia: {
		Pohnpei: ["Palikir"],
	},
	Monaco: {
		Monaco: ["Monaco"],
	},
	Mongolia: {
		Ulaanbaatar: ["Ulaanbaatar"],
		Darkhan: ["Darkhan"],
	},
	Montenegro: {
		Podgorica: ["Podgorica"],
		Nikšić: ["Nikšić"],
	},
	Mozambique: {
		Maputo: ["Maputo"],
		Matola: ["Matola"],
		Nampula: ["Nampula"],
	},
	Myanmar: {
		Yangon: ["Yangon"],
		Mandalay: ["Mandalay"],
		Naypyidaw: ["Naypyidaw"],
	},
	// N-Z countries
	Namibia: {
		Khomas: ["Windhoek"],
		Erongo: ["Walvis Bay"],
	},
	Nauru: {
		Yaren: ["Yaren"],
	},
	Nepal: {
		Bagmati: ["Kathmandu"],
		Gandaki: ["Pokhara"],
	},
	Nicaragua: {
		Managua: ["Managua"],
		León: ["León"],
	},
	Niger: {
		Niamey: ["Niamey"],
		Zinder: ["Zinder"],
	},
	"North Korea": {
		Pyongyang: ["Pyongyang"],
		Hamhung: ["Hamhung"],
	},
	"North Macedonia": {
		Skopje: ["Skopje"],
		Bitola: ["Bitola"],
	},
	Oman: {
		Muscat: ["Muscat"],
		Salalah: ["Salalah"],
	},
	Palau: {
		Koror: ["Koror"],
	},
	Panama: {
		Panamá: ["Panama City"],
		Colón: ["Colón"],
	},
	"Papua New Guinea": {
		"National Capital": ["Port Moresby"],
		Morobe: ["Lae"],
	},
	Paraguay: {
		Central: ["Asunción"],
		Alto: ["Ciudad del Este"],
	},
	Qatar: {
		Doha: ["Doha"],
		"Al Rayyan": ["Al Rayyan"],
	},
	"South Korea": {
		Seoul: ["Seoul"],
		Busan: ["Busan"],
		Incheon: ["Incheon"],
		Daegu: ["Daegu"],
		Daejeon: ["Daejeon"],
		Gwangju: ["Gwangju"],
	},
	Moldova: {
		Chișinău: ["Chișinău"],
		Bălți: ["Bălți"],
	},
	Rwanda: {
		Kigali: ["Kigali"],
	},
	"Saint Kitts and Nevis": {
		"Saint George": ["Basseterre"],
	},
	"Saint Lucia": {
		Castries: ["Castries"],
	},
	"Saint Vincent and the Grenadines": {
		"Saint George": ["Kingstown"],
	},
	Samoa: {
		Tuamasaga: ["Apia"],
	},
	"San Marino": {
		"San Marino": ["San Marino"],
	},
	"Sao Tome and Principe": {
		"São Tomé": ["São Tomé"],
	},
	Senegal: {
		Dakar: ["Dakar"],
		Thiès: ["Thiès"],
	},
	Serbia: {
		Belgrade: ["Belgrade"],
		Novi: ["Novi Sad"],
		Niš: ["Niš"],
	},
	Seychelles: {
		Mahé: ["Victoria"],
	},
	"Sierra Leone": {
		Western: ["Freetown"],
	},
	Slovakia: {
		Bratislava: ["Bratislava"],
		Košice: ["Košice"],
	},
	Slovenia: {
		Ljubljana: ["Ljubljana"],
		Maribor: ["Maribor"],
	},
	"Solomon Islands": {
		Guadalcanal: ["Honiara"],
	},
	Somalia: {
		Banaadir: ["Mogadishu"],
		Woqooyi: ["Hargeisa"],
	},
	"South Sudan": {
		Central: ["Juba"],
	},
	"Sri Lanka": {
		Western: ["Colombo"],
		Central: ["Kandy"],
	},
	Sudan: {
		Khartoum: ["Khartoum"],
		Omdurman: ["Omdurman"],
	},
	Suriname: {
		Paramaribo: ["Paramaribo"],
	},
	Syria: {
		Damascus: ["Damascus"],
		Aleppo: ["Aleppo"],
		Homs: ["Homs"],
	},
	Tajikistan: {
		Dushanbe: ["Dushanbe"],
	},
	"Timor-Leste": {
		Dili: ["Dili"],
	},
	Togo: {
		Maritime: ["Lomé"],
	},
	Tonga: {
		Tongatapu: ["Nuku'alofa"],
	},
	"Trinidad and Tobago": {
		"Port of Spain": ["Port of Spain"],
		"San Fernando": ["San Fernando"],
	},
	Tunisia: {
		Tunis: ["Tunis"],
		Sfax: ["Sfax"],
	},
	Türkiye: {
		Istanbul: ["Istanbul"],
		Ankara: ["Ankara"],
		Izmir: ["Izmir"],
		Bursa: ["Bursa"],
		Antalya: ["Antalya"],
	},
	Turkmenistan: {
		Asgabat: ["Asgabat"],
	},
	Tuvalu: {
		Funafuti: ["Funafuti"],
	},
	Uganda: {
		Central: ["Kampala"],
		Eastern: ["Jinja"],
	},
	"United Kingdom": {
		England: [
			"London",
			"Birmingham",
			"Manchester",
			"Leeds",
			"Liverpool",
			"Newcastle",
			"Sheffield",
			"Bristol",
			"Nottingham",
			"Southampton",
		],
		Scotland: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
		Wales: ["Cardiff", "Swansea", "Newport"],
		"Northern Ireland": ["Belfast", "Derry"],
	},
	Tanzania: {
		"Dar es Salaam": ["Dar es Salaam"],
		Mwanza: ["Mwanza"],
		Arusha: ["Arusha"],
	},
	Uruguay: {
		Montevideo: ["Montevideo"],
		Canelones: ["Ciudad de la Costa"],
	},
	Uzbekistan: {
		Tashkent: ["Tashkent"],
		Samarkand: ["Samarkand"],
		Bukhara: ["Bukhara"],
	},
	Vanuatu: {
		Shefa: ["Port Vila"],
	},
	Venezuela: {
		Capital: ["Caracas"],
		Miranda: ["Los Teques"],
		Zulia: ["Maracaibo"],
		Carabobo: ["Valencia"],
	},
	Yemen: {
		Sana: ["Sana'a"],
		Aden: ["Aden"],
		Taiz: ["Taiz"],
	},
	Zambia: {
		Lusaka: ["Lusaka"],
		Copperbelt: ["Kitwe", "Ndola"],
	},
	Zimbabwe: {
		Harare: ["Harare"],
		Bulawayo: ["Bulawayo"],
	},
};

// Helper functions for location data
function getCountries(): string[] {
	return Object.keys(LOCATION_DATA).sort();
}

function getStates(country: string): string[] {
	if (!country || !LOCATION_DATA[country]) return [];
	return Object.keys(LOCATION_DATA[country]).sort();
}

function getCities(country: string, state: string): string[] {
	if (!country || !state || !LOCATION_DATA[country]?.[state]) return [];
	return [...LOCATION_DATA[country][state]].sort();
}

// Helper function to calculate distance between two coordinates (in miles)
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

// Helper function to check if restaurant is open now
function isRestaurantOpen(hours: { open: string; close: string }): boolean {
	const now = new Date();
	const currentTime = now.getHours() * 60 + now.getMinutes();

	const [openHour, openMin] = hours.open.split(":").map(Number);
	const [closeHour, closeMin] = hours.close.split(":").map(Number);

	const openTime = openHour * 60 + openMin;
	const closeTime = closeHour * 60 + closeMin;

	// Handle cases where closing time is after midnight
	if (closeTime < openTime) {
		return currentTime >= openTime || currentTime <= closeTime;
	}

	return currentTime >= openTime && currentTime <= closeTime;
}

// Mock data generator
function generateMockRestaurants(
	location: LocationState,
	selectedCategories: string[],
): Restaurant[] {
	const restaurantNames: Record<string, string[]> = {
		Noodles: [
			"Noodle House",
			"Ramen Paradise",
			"Pho Station",
			"Udon Express",
			"Noodle Bar",
		],
		Vegetarian: [
			"Green Leaf Cafe",
			"Veggie Delight",
			"Plant Power",
			"The Garden Table",
			"Herbivore Haven",
		],
		Healthy: [
			"Fresh Bowl",
			"Nutrition Kitchen",
			"Wellness Cafe",
			"Clean Eats",
			"Health Hub",
		],
		"Fast-Food": [
			"Quick Bites",
			"Express Grill",
			"Speedy Diner",
			"Fast Fresh",
			"Rapid Eats",
		],
		"Best Tourist Spot": [
			"Landmark Bistro",
			"Heritage Kitchen",
			"City View Restaurant",
			"Tourist's Choice",
			"Famous Fare",
		],
	};

	const descriptions: Record<string, string> = {
		Noodles:
			"Authentic noodle dishes with traditional recipes and fresh ingredients.",
		Vegetarian:
			"Plant-based cuisine that celebrates vegetables and wholesome ingredients.",
		Healthy: "Nutritious meals designed for health-conscious diners.",
		"Fast-Food": "Quick and satisfying meals perfect for on-the-go dining.",
		"Best Tourist Spot":
			"A must-visit destination known for exceptional food and atmosphere.",
	};

	const restaurants: Restaurant[] = [];
	const categoriesToUse =
		selectedCategories.length > 0
			? selectedCategories
			: ["Noodles", "Vegetarian", "Healthy", "Fast-Food", "Best Tourist Spot"];

	// Generate operating hours (some restaurants open/closed)
	const hourOptions = [
		{ open: "08:00", close: "22:00" },
		{ open: "09:00", close: "21:00" },
		{ open: "10:00", close: "23:00" },
		{ open: "11:00", close: "20:00" },
		{ open: "07:00", close: "15:00" }, // Breakfast spot
		{ open: "17:00", close: "02:00" }, // Late night spot
	];

	for (const category of categoriesToUse) {
		const names = restaurantNames[category] || ["Generic Restaurant"];
		for (let index = 0; index < names.length; index++) {
			const name = names[index];
			const rating = 3.5 + Math.random() * 1.5;
			const reviewCount = Math.floor(50 + Math.random() * 450);
			const restaurantLat =
				(location.latitude || 40.7128) + (Math.random() - 0.5) * 0.1;
			const restaurantLon =
				(location.longitude || -74.006) + (Math.random() - 0.5) * 0.1;
			const hours = hourOptions[Math.floor(Math.random() * hourOptions.length)];

			const distance = location.latitude
				? calculateDistance(
						location.latitude,
						location.longitude || -74.006,
						restaurantLat,
						restaurantLon,
					)
				: Math.random() * 10; // Random distance up to 10 miles

			restaurants.push({
				id: `${category}-${index}`,
				name: `${name} - ${location.city}`,
				address: {
					street: `${100 + index * 10} Main Street`,
					city: location.city,
					state: location.state,
					country: location.country,
					zipCode: `${10000 + index * 100}`,
				},
				rating: Math.round(rating * 10) / 10,
				reviewCount,
				categories: [category],
				priceRange: Math.ceil(Math.random() * 4),
				description: descriptions[category] || "A wonderful dining experience.",
				latitude: restaurantLat,
				longitude: restaurantLon,
				reviews: generateMockReviews(3),
				distance: Math.round(distance * 10) / 10,
				hours,
				isOpenNow: isRestaurantOpen(hours),
			});
		}
	}

	return restaurants;
}

function generateMockReviews(count: number): Review[] {
	const comments = [
		"Amazing food and great service!",
		"A bit crowded but worth the wait.",
		"Excellent atmosphere and delicious dishes.",
		"Perfect spot for a quick meal.",
		"The best place I've tried in this area!",
	];

	const authors = ["John D.", "Sarah M.", "Michael K.", "Emma L.", "David P."];

	return Array.from({ length: count }, (_, i) => ({
		id: `review-${i}`,
		author: authors[i % authors.length],
		rating: 3 + Math.random() * 2,
		comment: comments[i % comments.length],
		date: new Date(
			Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
		).toLocaleDateString(),
	}));
}

function App() {
	const [location, setLocation] = useState<LocationState>({
		country: "",
		state: "",
		city: "",
	});
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
		new Set(),
	);
	const [showFavorites, setShowFavorites] = useState(false);
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);

	// Refinement filters
	const [priceFilter, setPriceFilter] = useState<number[]>([1, 2, 3, 4]);
	const [minRating, setMinRating] = useState<number>(0);
	const [sortBy, setSortBy] = useState<
		"distance" | "rating" | "reviews" | "none"
	>("none");
	const [openNowOnly, setOpenNowOnly] = useState(false);
	const [showRefinements, setShowRefinements] = useState(false);
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	const categories = [
		"Noodles",
		"Vegetarian",
		"Healthy",
		"Fast-Food",
		"Best Tourist Spot",
	];

	// Load favorites from localStorage
	useEffect(() => {
		const savedFavorites = localStorage.getItem("foodie-favorites");
		if (savedFavorites) {
			setFavorites(new Set(JSON.parse(savedFavorites)));
		}
	}, []);

	// Save favorites to localStorage
	useEffect(() => {
		localStorage.setItem(
			"foodie-favorites",
			JSON.stringify(Array.from(favorites)),
		);
	}, [favorites]);

	const handleSearch = () => {
		if (!location.city || !location.state || !location.country) {
			alert("Please enter Country, State, and City");
			return;
		}
		const results = generateMockRestaurants(
			location,
			Array.from(selectedCategories),
		);
		setRestaurants(results);
		setShowFavorites(false);
	};

	const handleGetCurrentLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					// Mock reverse geocoding
					setLocation({
						country: "United States",
						state: "New York",
						city: "New York City",
						latitude,
						longitude,
					});
					setIsGettingLocation(false);
					const results = generateMockRestaurants(
						{
							country: "United States",
							state: "New York",
							city: "New York City",
							latitude,
							longitude,
						},
						Array.from(selectedCategories),
					);
					setRestaurants(results);
					setShowFavorites(false);
				},
				(error) => {
					alert("Unable to get your location. Please enter manually.");
					setIsGettingLocation(false);
				},
			);
		} else {
			alert("Geolocation is not supported by your browser.");
			setIsGettingLocation(false);
		}
	};

	const toggleFavorite = (restaurantId: string) => {
		setFavorites((prev) => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(restaurantId)) {
				newFavorites.delete(restaurantId);
			} else {
				newFavorites.add(restaurantId);
			}
			return newFavorites;
		});
	};

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev) => {
			const newCategories = new Set(prev);
			if (newCategories.has(category)) {
				newCategories.delete(category);
			} else {
				newCategories.add(category);
			}
			return newCategories;
		});
	};

	const openInMaps = (restaurant: Restaurant) => {
		const address = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`;
		const encodedAddress = encodeURIComponent(address);

		// Detect platform
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isAndroid = /Android/.test(navigator.userAgent);

		let mapsUrl = "";
		if (isIOS) {
			mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
		} else if (isAndroid) {
			mapsUrl = `geo:0,0?q=${encodedAddress}`;
		} else {
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
		}

		window.open(mapsUrl, "_blank");
	};

	const togglePriceFilter = (price: number) => {
		setPriceFilter((prev) => {
			if (prev.includes(price)) {
				return prev.filter((p) => p !== price);
			}
			return [...prev, price].sort();
		});
	};

	const clearAllFilters = () => {
		setPriceFilter([1, 2, 3, 4]);
		setMinRating(0);
		setSortBy("none");
		setOpenNowOnly(false);
	};

	// Apply filters and sorting
	let displayedRestaurants = showFavorites
		? restaurants.filter((r) => favorites.has(r.id))
		: restaurants;

	// Apply price filter
	displayedRestaurants = displayedRestaurants.filter((r) =>
		priceFilter.includes(r.priceRange),
	);

	// Apply rating filter
	displayedRestaurants = displayedRestaurants.filter(
		(r) => r.rating >= minRating,
	);

	// Apply open now filter
	if (openNowOnly) {
		displayedRestaurants = displayedRestaurants.filter((r) => r.isOpenNow);
	}

	// Apply sorting
	if (sortBy === "distance") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => (a.distance || 0) - (b.distance || 0),
		);
	} else if (sortBy === "rating") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => b.rating - a.rating,
		);
	} else if (sortBy === "reviews") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => b.reviewCount - a.reviewCount,
		);
	}

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={`star-${rating}-${i}`}
					className={cn(
						"size-4",
						i < Math.floor(rating)
							? "fill-primary text-primary"
							: i < rating
								? "fill-primary/50 text-primary"
								: "fill-muted text-muted",
					)}
				/>,
			);
		}
		return (
			<div className="flex items-center gap-1">
				{stars}
				<span className="text-sm font-medium ml-1 text-foreground">
					{rating.toFixed(1)}
				</span>
			</div>
		);
	};

	const renderPriceRange = (priceRange: number) => {
		const dollars = [];
		for (let i = 0; i < 4; i++) {
			dollars.push(
				<DollarSign
					key={`price-${priceRange}-${i}`}
					className={cn(
						"size-4",
						i < priceRange ? "text-secondary" : "text-muted",
					)}
				/>,
			);
		}
		return <div className="flex items-center gap-0.5">{dollars}</div>;
	};

	return (
		<Layout>
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Hero Header - Dark Theme */}
				<div className="mb-8 md:mb-12 text-center relative px-4">
					{/* Decorative top border */}
					<div className="flex items-center justify-center mb-4 md:mb-6">
						<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent w-full max-w-md shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.4)]" />
					</div>

					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif-display text-white mb-3 md:mb-4 tracking-tight">
						Discover Your Next
						<span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mt-2 drop-shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.3)]">
							Culinary Adventure
						</span>
					</h1>

					<p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto font-serif-elegant leading-relaxed">
						Embark on a journey through extraordinary flavors and unforgettable
						dining experiences
					</p>

					{/* Decorative bottom border with ornament */}
					<div className="flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6">
						<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-primary/80 w-20 md:w-32 shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.4)]" />
						<div className="w-2 h-2 rotate-45 border border-primary/80 shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)]" />
						<div className="h-px bg-gradient-to-l from-transparent via-primary/60 to-primary/80 w-20 md:w-32 shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.4)]" />
					</div>
				</div>

				{/* Search Section - Floating Light Module */}
				<Card className="mb-12 relative shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card overflow-hidden hover:shadow-[0_0_40px_oklch(0.68_0.24_300_/_0.35),0_10px_28px_black] transition-all">
					{/* Subtle glowing texture overlay */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.68_0.24_300_/_0.2)_10px,oklch(0.68_0.24_300_/_0.2)_11px)] pointer-events-none" />

					<CardHeader className="text-center pb-6 relative z-10">
						{/* Ornate icon frame with glow */}
						<div className="mb-5 mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.5)] border-2 border-primary/50">
							<Search className="h-8 w-8 text-white stroke-[2.5] drop-shadow-[0_0_8px_white]" />
						</div>
						<CardTitle className="text-3xl font-serif-display text-card-foreground mb-2">
							Your Expedition Begins
						</CardTitle>
						<CardDescription className="text-base text-card-foreground/70 font-serif-elegant max-w-lg mx-auto">
							Chart your course through the world's finest dining establishments
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 relative z-10">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
							{/* Country Dropdown */}
							<div className="space-y-2">
								<Label
									htmlFor="country"
									className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
								>
									Country
								</Label>
								<Combobox
									options={getCountries().map((country) => ({
										value: country,
										label: country,
									}))}
									value={location.country}
									onValueChange={(value) => {
										setLocation({ country: value, state: "", city: "" });
									}}
									placeholder="Select a country"
									searchPlaceholder="Search countries..."
									emptyText="No country found."
								/>
							</div>

							{/* State Dropdown */}
							<div className="space-y-2">
								<Label
									htmlFor="state"
									className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
								>
									State/Province
								</Label>
								<Select
									value={location.state}
									onValueChange={(value) => {
										setLocation({ ...location, state: value, city: "" });
									}}
									disabled={!location.country}
								>
									<SelectTrigger id="state">
										<SelectValue
											placeholder={
												location.country
													? "Select a state"
													: "Select country first"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{getStates(location.country).map((state) => (
											<SelectItem key={state} value={state}>
												{state}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* City Dropdown */}
							<div className="space-y-2">
								<Label
									htmlFor="city"
									className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
								>
									City
								</Label>
								<Select
									value={location.city}
									onValueChange={(value) => {
										setLocation({ ...location, city: value });
									}}
									disabled={!location.state}
								>
									<SelectTrigger id="city">
										<SelectValue
											placeholder={
												location.state ? "Select a city" : "Select state first"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{getCities(location.country, location.state).map((city) => (
											<SelectItem key={city} value={city}>
												{city}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						{/* Action Buttons with Ornate Styling */}
						<div className="flex flex-wrap gap-4 justify-center">
							<Button
								onClick={handleSearch}
								size="lg"
								className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-layered font-semibold tracking-wide px-8 py-6 text-base border border-primary/20"
							>
								<Search className="mr-2 h-5 w-5" />
								Start Exploring
							</Button>
							<Button
								variant="outline"
								size="lg"
								onClick={handleGetCurrentLocation}
								disabled={isGettingLocation}
								className="border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 font-semibold tracking-wide px-8 py-6 text-base shadow-md"
							>
								<Navigation className="mr-2 h-5 w-5" />
								{isGettingLocation ? "Locating..." : "Use My Location"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Category Filters - Floating Light Module */}
				<Card className="mb-10 border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.68_0.24_300_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden">
					{/* Subtle glowing texture */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.68_0.24_300_/_0.15)_10px,oklch(0.68_0.24_300_/_0.15)_11px)] pointer-events-none" />

					<CardHeader className="relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/50 shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.4)]">
								<Filter className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.68_0.24_300_/_0.5)]" />
							</div>
							<CardTitle className="text-2xl font-serif-elegant text-card-foreground">
								Culinary Categories
							</CardTitle>
						</div>
						<CardDescription className="text-base font-serif-elegant text-card-foreground/70 ml-13">
							Refine your journey by selecting one or more cuisines
						</CardDescription>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex flex-wrap gap-3">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										selectedCategories.has(category) ? "default" : "outline"
									}
									className={cn(
										"cursor-pointer px-5 py-2.5 text-sm font-semibold transition-all tracking-wide",
										selectedCategories.has(category)
											? "bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] border-2 border-primary/60 hover:shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.5)]"
											: "border-2 border-primary/40 bg-card hover:bg-primary/10 hover:border-primary/60 shadow-sm",
									)}
									onClick={() => toggleCategory(category)}
								>
									{category}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Mobile Filter Button */}
				{restaurants.length > 0 && (
					<div className="md:hidden mb-4">
						<Button
							onClick={() => setShowMobileFilters(true)}
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
						>
							<SlidersHorizontal className="mr-2 h-5 w-5" />
							Filters & Sort
						</Button>
					</div>
				)}

				{/* Mobile Filter Overlay */}
				{showMobileFilters && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
					<div
						className="md:hidden fixed inset-0 z-50 bg-black/50"
						onClick={() => setShowMobileFilters(false)}
					>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
						<div
							className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[oklch(0.97_0.008_75)] shadow-2xl overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b-2 border-primary/20 sticky top-0 bg-[oklch(0.97_0.008_75)] z-10">
								<div className="flex items-center justify-between mb-2">
									<h2 className="text-xl font-serif-display text-[oklch(0.2_0.03_145)]">
										Filters & Sort
									</h2>
									<button
										type="button"
										onClick={() => setShowMobileFilters(false)}
										className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
									>
										<X className="h-5 w-5 text-primary" />
									</button>
								</div>
								<p className="text-sm text-[oklch(0.35_0.03_145)] font-serif-elegant">
									Filter and sort results
								</p>
							</div>
							<div className="p-6 space-y-6">
								{/* Price Range Filter */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Price Range</Label>
									<div className="flex flex-wrap gap-2">
										{[1, 2, 3, 4].map((price) => (
											<Button
												key={price}
												variant={
													priceFilter.includes(price) ? "default" : "outline"
												}
												size="sm"
												onClick={() => togglePriceFilter(price)}
												className="gap-1"
											>
												{"$".repeat(price)}
											</Button>
										))}
									</div>
								</div>

								{/* Rating Filter */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base font-semibold">
											Minimum Rating
										</Label>
										<span className="text-sm font-medium">
											{minRating === 0
												? "Any"
												: `${minRating.toFixed(1)}+ stars`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-gray-500">
										<span>Any</span>
										<span>5 stars</span>
									</div>
								</div>

								{/* Sort By */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Sort By</Label>
									<Select
										value={sortBy}
										onValueChange={(value) =>
											setSortBy(
												value as "distance" | "rating" | "reviews" | "none",
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Default</SelectItem>
											<SelectItem value="distance">
												Distance (Closest First)
											</SelectItem>
											<SelectItem value="rating">
												Rating (Highest First)
											</SelectItem>
											<SelectItem value="reviews">Most Reviews</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Open Now Toggle */}
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base font-semibold">Open Now</Label>
										<p className="text-sm text-gray-500">
											Show only restaurants currently open
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
									/>
								</div>

								{/* Clear Filters Button */}
								<div className="pt-2 border-t">
									<Button
										variant="outline"
										className="w-full"
										onClick={clearAllFilters}
									>
										Clear All Filters
									</Button>
								</div>

								{/* Apply Button */}
								<Button
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
									onClick={() => setShowMobileFilters(false)}
								>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Desktop Search Refinement Component - Floating Light Module */}
				{restaurants.length > 0 && (
					<Card className="mb-8 hidden md:block border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] relative overflow-hidden z-50">
						{/* Subtle glowing texture */}
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.68_0.24_300_/_0.15)_8px,oklch(0.68_0.24_300_/_0.15)_9px)] pointer-events-none" />

						<CardHeader className="relative z-10">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2 text-card-foreground">
										<SlidersHorizontal className="size-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.68_0.24_300_/_0.4)]" />
										Refine Search
									</CardTitle>
									<CardDescription className="text-card-foreground/70">
										Filter and sort results by price, rating, distance, and more
									</CardDescription>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowRefinements(!showRefinements)}
									className="hover:bg-primary/10"
								>
									{showRefinements ? "Hide" : "Show"}
								</Button>
							</div>
						</CardHeader>
						{showRefinements && (
							<CardContent className="space-y-6">
								{/* Price Range Filter */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Price Range</Label>
									<div className="flex flex-wrap gap-2">
										{[1, 2, 3, 4].map((price) => (
											<Button
												key={price}
												variant={
													priceFilter.includes(price) ? "default" : "outline"
												}
												size="sm"
												onClick={() => togglePriceFilter(price)}
												className="gap-1"
											>
												{"$".repeat(price)}
											</Button>
										))}
									</div>
								</div>

								{/* Rating Filter */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base font-semibold">
											Minimum Rating
										</Label>
										<span className="text-sm font-medium">
											{minRating === 0
												? "Any"
												: `${minRating.toFixed(1)}+ stars`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-gray-500">
										<span>Any</span>
										<span>5 stars</span>
									</div>
								</div>

								{/* Sort By */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Sort By</Label>
									<Select
										value={sortBy}
										onValueChange={(value) =>
											setSortBy(
												value as "distance" | "rating" | "reviews" | "none",
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Default</SelectItem>
											<SelectItem value="distance">
												Distance (Closest First)
											</SelectItem>
											<SelectItem value="rating">
												Rating (Highest First)
											</SelectItem>
											<SelectItem value="reviews">Most Reviews</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Open Now Toggle */}
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base font-semibold">Open Now</Label>
										<p className="text-sm text-gray-500">
											Show only restaurants currently open
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
									/>
								</div>

								{/* Clear Filters Button */}
								<div className="pt-2 border-t">
									<Button
										variant="outline"
										className="w-full"
										onClick={clearAllFilters}
									>
										Clear All Filters
									</Button>
								</div>
							</CardContent>
						)}
					</Card>
				)}

				{/* Results Header - Dark Theme */}
				{restaurants.length > 0 && (
					<div className="mb-6 md:mb-8 space-y-4 px-4 md:px-0">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h2 className="text-2xl md:text-3xl font-serif-display text-white drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.2)]">
									{showFavorites
										? `Your Curated Collection (${favorites.size})`
										: `${restaurants.length} Distinguished Establishments`}
								</h2>
								{displayedRestaurants.length !== restaurants.length && (
									<p className="text-sm text-white/80 mt-2 font-serif-elegant">
										Showcasing {displayedRestaurants.length} refined selections
									</p>
								)}
							</div>
							<Button
								variant={showFavorites ? "default" : "outline"}
								onClick={() => setShowFavorites(!showFavorites)}
								className={cn(
									"font-semibold tracking-wide shadow-md",
									showFavorites
										? "shadow-layered"
										: "border-2 border-primary/40",
								)}
							>
								<Heart
									className={cn("size-4 mr-2", showFavorites && "fill-current")}
								/>
								{showFavorites ? "View All" : `Favorites (${favorites.size})`}
							</Button>
						</div>

						{/* Active Filters Summary */}
						{(priceFilter.length < 4 ||
							minRating > 0 ||
							sortBy !== "none" ||
							openNowOnly) && (
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-gray-700">
									Active Filters:
								</span>
								{priceFilter.length < 4 && (
									<Badge variant="secondary" className="gap-1">
										Price: {priceFilter.map((p) => "$".repeat(p)).join(", ")}
									</Badge>
								)}
								{minRating > 0 && (
									<Badge variant="secondary">
										Rating: {minRating.toFixed(1)}+ stars
									</Badge>
								)}
								{sortBy !== "none" && (
									<Badge variant="secondary" className="gap-1">
										<ArrowUpDown className="size-3" />
										{sortBy === "distance"
											? "Distance"
											: sortBy === "rating"
												? "Rating"
												: "Reviews"}
									</Badge>
								)}
								{openNowOnly && (
									<Badge variant="secondary" className="gap-1">
										<Clock className="size-3" />
										Open Now
									</Badge>
								)}
							</div>
						)}
					</div>
				)}

				{/* Restaurant Listing Cards - Floating Light Modules */}
				<div className="space-y-8">
					{displayedRestaurants.map((restaurant) => (
						<Card
							key={restaurant.id}
							className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.68_0.24_300_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.68_0.24_300_/_0.3),0_8px_24px_black] hover:border-primary/60 transition-all duration-300 relative overflow-hidden"
						>
							{/* Subtle glowing texture */}
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.68_0.24_300_/_0.15)_8px,oklch(0.68_0.24_300_/_0.15)_9px)] pointer-events-none" />

							<CardContent className="p-4 md:p-8 relative z-10">
								<div className="flex flex-col md:flex-row gap-4 md:gap-8">
									{/* Photo Placeholder - Left Side */}
									<div className="flex-shrink-0">
										<div className="w-full md:w-64 h-48 md:h-64 rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.92_0.015_70)] to-[oklch(0.88_0.02_65)] shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.2)] flex items-center justify-center relative overflow-hidden group">
											{/* Decorative pattern overlay */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,oklch(0.85_0.02_70_/_0.15)_12px,oklch(0.85_0.02_70_/_0.15)_13px)] pointer-events-none" />
											{/* Icon placeholder */}
											<Utensils className="h-16 md:h-20 w-16 md:w-20 text-primary/50 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.3)]" />
										</div>
									</div>

									{/* Main Content - Right Side */}
									<div className="flex-1 space-y-3 md:space-y-5">
										{/* Restaurant Name & Favorite */}
										<div className="flex items-start justify-between gap-4">
											<h3 className="text-xl md:text-2xl lg:text-3xl font-serif-display text-card-foreground tracking-tight leading-tight">
												{restaurant.name}
											</h3>
											<Button
												size="icon"
												variant={
													favorites.has(restaurant.id) ? "default" : "outline"
												}
												onClick={() => toggleFavorite(restaurant.id)}
												className={cn(
													"cursor-pointer shadow-md flex-shrink-0",
													favorites.has(restaurant.id)
														? "shadow-layered"
														: "border-2 border-primary/30",
												)}
											>
												<Heart
													className={cn(
														"size-4",
														favorites.has(restaurant.id) && "fill-current",
													)}
												/>
											</Button>
										</div>

										{/* Location & Cuisine Type */}
										<div className="flex flex-wrap items-center gap-3">
											<div className="flex items-center gap-2 text-card-foreground/80 text-base font-serif-elegant">
												<MapPin className="size-5 text-primary flex-shrink-0 stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.68_0.24_300_/_0.4)]" />
												<span>
													{restaurant.address.city}, {restaurant.address.state}
												</span>
											</div>
											<span className="text-card-foreground/60">•</span>
											<div className="flex flex-wrap gap-2">
												{restaurant.categories.map((cat) => (
													<Badge
														key={cat}
														variant="secondary"
														className="font-serif-elegant font-medium shadow-sm px-3 py-1 border border-primary/20"
													>
														{cat}
													</Badge>
												))}
											</div>
										</div>

										{/* Star Rating - Glowing Accent */}
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={`star-${restaurant.id}-${i}`}
														className={cn(
															"size-5",
															i < Math.floor(restaurant.rating)
																? "fill-secondary text-secondary drop-shadow-[0_0_8px_oklch(0.78_0.12_85_/_0.5)]"
																: i < restaurant.rating
																	? "fill-secondary/50 text-secondary drop-shadow-[0_0_6px_oklch(0.78_0.12_85_/_0.3)]"
																	: "fill-muted text-muted",
														)}
													/>
												))}
											</div>
											<span className="text-lg font-serif-elegant font-semibold text-secondary drop-shadow-[0_0_8px_oklch(0.78_0.12_85_/_0.4)]">
												{restaurant.rating.toFixed(1)} / 5.0
											</span>
											<span className="text-sm text-card-foreground/70">
												({restaurant.reviewCount} reviews)
											</span>
										</div>

										{/* Dining Experience Summary */}
										<p className="text-base font-serif-elegant text-card-foreground/80 leading-relaxed">
											{restaurant.description}
										</p>

										{/* Additional Details */}
										<div className="flex flex-wrap items-center gap-4 text-sm">
											{/* Price Range */}
											<div className="flex items-center gap-1.5">
												<DollarSign className="size-4 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.78_0.12_85_/_0.4)]" />
												<span className="font-serif-elegant text-card-foreground/80">
													{"$".repeat(restaurant.priceRange)} Pricing
												</span>
											</div>

											{/* Distance */}
											{restaurant.distance !== undefined && (
												<>
													<span className="text-card-foreground/60">•</span>
													<span className="font-serif-elegant text-card-foreground/80">
														{restaurant.distance.toFixed(1)} miles away
													</span>
												</>
											)}

											{/* Operating Status */}
											{restaurant.hours && (
												<>
													<span className="text-card-foreground/60">•</span>
													<div className="flex items-center gap-2">
														<Clock className="size-4 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.68_0.24_300_/_0.4)]" />
														<span className="font-serif-elegant text-card-foreground/80">
															{restaurant.hours.open} - {restaurant.hours.close}
														</span>
														<Badge
															variant={
																restaurant.isOpenNow ? "default" : "secondary"
															}
															className={cn(
																"text-xs",
																restaurant.isOpenNow &&
																	"bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.4)] border border-primary/40",
															)}
														>
															{restaurant.isOpenNow ? "Open Now" : "Closed"}
														</Badge>
													</div>
												</>
											)}
										</div>

										{/* View Details CTA */}
										<div className="pt-3">
											<Button
												className="cursor-pointer group bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] px-8 py-5 text-base transition-all duration-300 border-2 border-primary/60"
												onClick={() =>
													setSelectedRestaurant(
														selectedRestaurant?.id === restaurant.id
															? null
															: restaurant,
													)
												}
											>
												{selectedRestaurant?.id === restaurant.id
													? "Hide Details"
													: "View Details"}
												<ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
											</Button>
										</div>

										{/* Expanded Details Section */}
										{selectedRestaurant?.id === restaurant.id && (
											<div className="mt-6 pt-6 border-t-2 border-primary/30 shadow-[0_-2px_20px_oklch(0.68_0.24_300_/_0.1)] space-y-5">
												{/* Full Address */}
												<div className="flex items-start gap-3">
													<MapPin className="size-5 mt-0.5 shrink-0 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)]" />
													<div className="flex-1">
														<p className="text-sm font-serif-elegant font-semibold text-card-foreground mb-1">
															Full Address
														</p>
														<p className="text-base font-serif-elegant text-card-foreground/80">
															{restaurant.address.street}
															<br />
															{restaurant.address.city},{" "}
															{restaurant.address.state}{" "}
															{restaurant.address.zipCode}
															<br />
															{restaurant.address.country}
														</p>
													</div>
												</div>

												{/* Recent Reviews */}
												<div>
													<h4 className="text-lg font-serif-display text-card-foreground mb-4">
														Recent Reviews
													</h4>
													<div className="space-y-4">
														{restaurant.reviews.map((review) => (
															<div
																key={review.id}
																className="border-l-3 border-secondary pl-4 bg-[oklch(0.96_0.01_75)] py-3 px-4 rounded-sm shadow-[0_0_15px_oklch(0.78_0.12_85_/_0.15)]"
															>
																<div className="flex items-center gap-3 mb-2">
																	<span className="font-serif-elegant font-semibold text-sm text-[oklch(0.2_0.03_145)]">
																		{review.author}
																	</span>
																	<div className="flex items-center gap-1">
																		{[...Array(5)].map((_, i) => (
																			<Star
																				key={`review-star-${review.id}-${i}`}
																				className={cn(
																					"size-3.5",
																					i < Math.floor(review.rating)
																						? "fill-secondary text-secondary drop-shadow-[0_0_6px_oklch(0.78_0.12_85_/_0.4)]"
																						: "fill-muted text-muted",
																				)}
																			/>
																		))}
																	</div>
																	<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)]">
																		{review.date}
																	</span>
																</div>
																<p className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] leading-relaxed">
																	{review.comment}
																</p>
															</div>
														))}
													</div>
												</div>

												{/* Map Direction Button */}
												<Button
													variant="outline"
													className="cursor-pointer w-full border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 font-serif-elegant font-semibold tracking-wide shadow-md py-6"
													onClick={() => openInMaps(restaurant)}
												>
													<MapPin className="size-5 mr-2" />
													Get Directions
												</Button>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Empty State - Floating Light Module */}
				{restaurants.length === 0 && (
					<Card className="text-center py-16 shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.68_0.24_300_/_0.15)_8px,oklch(0.68_0.24_300_/_0.15)_9px)] pointer-events-none" />
						<CardContent className="relative z-10">
							<div className="mx-auto w-20 h-20 rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 border-2 border-primary/50 shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)]">
								<Search className="size-10 text-primary stroke-[2.5] drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.5)]" />
							</div>
							<h3 className="text-3xl font-serif-display text-card-foreground mb-3">
								Begin Your Expedition
							</h3>
							<p className="text-card-foreground/80 font-serif-elegant text-lg max-w-md mx-auto">
								Chart your destination above to unveil extraordinary culinary
								experiences awaiting your discovery
							</p>
						</CardContent>
					</Card>
				)}

				{/* Empty Favorites State - Floating Light Module */}
				{showFavorites &&
					displayedRestaurants.length === 0 &&
					restaurants.length > 0 && (
						<Card className="text-center py-12 shadow-[0_0_30px_oklch(0.68_0.24_300_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.68_0.24_300_/_0.15)_8px,oklch(0.68_0.24_300_/_0.15)_9px)] pointer-events-none" />
							<CardContent className="relative z-10">
								<Heart className="size-16 mx-auto text-primary/50 mb-4 drop-shadow-[0_0_15px_oklch(0.68_0.24_300_/_0.3)]" />
								<h3 className="text-xl font-serif-display text-card-foreground mb-2">
									No Favorites Yet
								</h3>
								<p className="text-card-foreground/80 font-serif-elegant mb-4">
									Start adding restaurants to your favorites list
								</p>
								<Button
									onClick={() => setShowFavorites(false)}
									className="bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.68_0.24_300_/_0.4)] border-2 border-primary/60"
								>
									Browse Restaurants
								</Button>
							</CardContent>
						</Card>
					)}
			</div>

			{/* Professional Footer - Deep Midnight Navy with Glowing Accents */}
			<footer className="relative mt-16 md:mt-24 bg-gradient-to-b from-[oklch(0.10_0.018_280)] to-[oklch(0.08_0.02_280)] border-t-2 border-primary/40 shadow-[0_-4px_30px_oklch(0.68_0.24_300_/_0.15)]">
				<div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
						{/* Company Info */}
						<div className="space-y-5">
							<h3 className="text-xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.68_0.24_300_/_0.3)]">
								Mapetite
							</h3>
							<p className="text-sm font-serif-elegant text-white/90 leading-relaxed">
								Discover exquisite restaurants worldwide with our premium dining
								discovery platform.
							</p>
						</div>

						{/* About Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								About
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#about-us"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#our-story"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Our Story
									</a>
								</li>
								<li>
									<a
										href="#team"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Team
									</a>
								</li>
							</ul>
						</div>

						{/* Legal Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Legal
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#privacy-policy"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#terms-of-service"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="#cookies"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Cookie Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Contact Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Contact
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="mailto:info@mapetite.com"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										info@mapetite.com
									</a>
								</li>
								<li>
									<a
										href="#support"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Support Center
									</a>
								</li>
								<li>
									<a
										href="#contact-us"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
									>
										Contact Us
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t-2 border-primary/30">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-sm font-serif-elegant text-white/90">
								© 2024 Mapetite. All rights reserved.
							</p>
							<div className="flex gap-6">
								<a
									href="#facebook"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
								>
									Facebook
								</a>
								<a
									href="#twitter"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
								>
									Twitter
								</a>
								<a
									href="#instagram"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
								>
									Instagram
								</a>
								<a
									href="#linkedin"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.68_0.24_300_/_0.5)] transition-all cursor-pointer"
								>
									LinkedIn
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</Layout>
	);
}

# RPUK Activityanalyser

[![GitHub license](https://img.shields.io/github/license/dukeofsussex/rpuk-activityanalyser)](https://github.com/dukeofsussex/rpuk-activityanalyser/blob/master/LICENSE)
![GitHub package.json version](https://img.shields.io/github/package-json/v/dukeofsussex/rpuk-activityanalyser)
[![RPUK Profile](https://img.shields.io/badge/RPUK-Duke%20of%20Sussex-green)](https://www.roleplay.co.uk/profile/70814-duke-of-sussex/)

Import and analyse faction/group activity CSVS for [RPUK FiveM](https://roleplay.co.uk).

## Preview

Try it out [here](https://dukeofsussex.dev/projects/rpuk/aa).

## Prerequisites

* [NodeJS](https://nodejs.org/en/)
* Proxy for Discord CDN (CORS restrictions)
  > Only required if CSVs are being imported directly from the Discord CDN due to cross-origin requests being blocked in browsers.

## Installation

1. Fork and clone this repository
2. ```cd``` into the cloned repository's folder
3. Run ```npm install``` to retrieve/install all dependencies
4. (Optional: Configure the proxy by creating a file `.env` in the root directory with the following parameter)

```yaml
PUBLIC_DISCORD_PROXY=<your proxy>
```

5. Run ```npm run dev``` to launch the development server
6. Navigate to ```http://localhost:8080``` in your preferred browser

## Contributing

Any contributions made are welcome and greatly appreciated.

1. Fork the project
2. Create your feature branch (`git checkout -b feature`)
3. Code it
4. Commit your changes (`git commit -m 'Add something awesome'`)
5. Push to the branch (`git push origin feature`)
6. Open a Pull Request

## License

This project is licensed under the GNU GPL License. See the [LICENSE](LICENSE) file for details.

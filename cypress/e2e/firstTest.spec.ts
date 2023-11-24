/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach(() => {
        cy.intercept(
            { method: 'GET', path: 'tags' },
            {
                fixture: 'tags.json',
            },
        )
        cy.loginToApplication()
    })

    it('should verify correct request and response', () => {
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as(
            'postArticle',
        )

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is my new the title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticle').then(xhr => {
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal(
                'This is a body of the article',
            )
            expect(xhr.response.body.article.description).to.equal(
                'This is a description',
            )
        })
    })

    it('should intercept and modify the request', () => {
        cy.intercept('POST', '**/articles', req => {
            req.body.article.description = 'This is test description 2'
        }).as('postArticle')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is my new the title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticle').then(xhr => {
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal(
                'This is a body of the article',
            )
            expect(xhr.response.body.article.description).to.equal(
                'This is test description 2',
            )
        })
    })

    it('should verify tags are displayed', () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'dima')
    })

    it('should verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {
            articles: [],
            articlesCount: 0,
        })
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', {
            fixture: 'articles.json',
        })

        cy.get('app-article-list button').then(likeList => {
            expect(likeList[0]).to.contain(1)
            expect(likeList[1]).to.contain(5)
            expect(likeList[2]).to.contain(7)
        })

        cy.fixture('articles.json').then(file => {
            const articlesLink = file.articles[0].slug
            file.articles[0].favoritesCount = 2
            cy.intercept(
                'POST',
                `https://api.realworld.io/api/articles/${articlesLink}/favorite`,
                file,
            )
        })

        cy.get('app-favorite-button').eq(0).click().should('contain', 2)
    })

    it('should delete article', () => {
        cy.get('@token').then(token => {
            const bodyRequest = {
                article: {
                    body: 'some postman body test',
                    description: 'postman request test',
                    tagList: [],
                    title: 'some postman title test',
                },
            }

            cy.request({
                url: 'https://api.realworld.io/api/articles/',
                headers: {
                    Authorization: `Token ${token}`,
                },
                method: 'POST',
                body: bodyRequest,
            }).then(response => {
                expect(response.status).to.equal(201)
            })

            cy.get('app-article-preview')
                .contains('Read more...')
                .first()
                .click()
            cy.get('.article-actions').contains('Delete Article').click()

            cy.request({
                url: 'https://conduit.productionready.io/api/articles?limit=10&offset=0',
                headers: { Authorization: `Token ${token}` },
                method: 'GET',
            })
                .its('body')
                .then(body => {
                    expect(body.articles[0].title).not.to.equal(
                        bodyRequest.article.title,
                    )
                })
        })
    })
})

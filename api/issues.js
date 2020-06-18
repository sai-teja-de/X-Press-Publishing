const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Middleware
issuesRouter.param('issueId', (req,res,next,issueId) => {
    db.get('SELECT * FROM Issue WHERE Issue.id=$issueId',{$issueId: issueId}, (err, issue) => {
        if(err) {
            next(err);
        } else if(issue) {
            req.issue = issue;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

issuesRouter.get('/', (req,res,next) =>{
    db.all(`SELECT * FROM Issue WHERE Issue.series_id=${req.params.seriesId}`, (error,issues) => {
        if(error) {
            next(error);
        }
        res.status(200).json({issues: issues})
    })
});

issuesRouter.post("/", (req, res, next) => {
	const name = req.body.issue.name;
	const issueNumber = req.body.issue.issueNumber;
	const publicationDate = req.body.issue.publicationDate;
	const artistId = req.body.issue.artistId;
	const artistSql = "SELECT * FROM Artist WHERE Artist.id = $artistId";
	const artistValues = {$artistId: artistId};
	db.get(artistSql, artistValues, (err, artist) => {
		if(err) {
			next(err);
		} else {
			if(!name || !issueNumber || !publicationDate || !artist) {
				return res.status(400).send()
			}
			const sql = "INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)";
			const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: req.params.seriesId };
			db.run(sql, values, function(err) {
				if(err) {
					next(err);
				} else {
					db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
						if(err) {
							next(err);
						} else {
							res.status(201).json({issue: issue});
						}
					});
				}
			});
		}
	});
});

issuesRouter.put("/:issueId", (req, res, next) => {
	const name = req.body.issue.name;
	const issueNumber = req.body.issue.issueNumber;
	const publicationDate = req.body.issue.publicationDate;
	const artistId = req.body.issue.artistId;
	const artistSql = "SELECT * FROM Artist WHERE Artist.id = $artistId";
	const artistValues = {$artistId: artistId};
	db.get(artistSql, artistValues, (err, artist) => {
		if(err) {
			next(err);
		} else {
			if(!name || !issueNumber || !publicationDate || !artist) {
				return res.status(400).send();
			}
			const sql = "UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId";
			const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $issueId: req.params.issueId };
			db.run(sql,values, (err) => {
				if(err) {
					next(err);
				} else {
					db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
						res.status(200).json({issue: issue});
					});
				}
			});
		}
	});
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    const sql = 'DELETE FROM Issue WHERE Issue.id = $issueId';
    const values = {$issueId: req.params.issueId};
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
  });;





module.exports = issuesRouter;
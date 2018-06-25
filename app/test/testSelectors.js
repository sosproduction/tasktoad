/* eslint no-unused-expressions: 0, no-shadow: 0 */
import { expect } from 'chai';
import {
    projects,
    project,
    tasks,
} from '../selectors';
import { schema } from '../models';
import factory from './factories';
import Promise from 'bluebird';
import { applyActionAndGetNextSession, ReduxORMAdapter } from './utils';

describe('Selectors', () => {
    let ormState;
    let session;
    let state;

    beforeEach(done => {
        ormState = schema.getDefaultState();

        session = schema.withMutations(ormState);

        factory.setAdapter(new ReduxORMAdapter(session));

        factory.createMany('Project', 2).then(projects => {
            return Promise.all(projects.map(project => {
                const projectId = project.getId();

                return factory.createMany('Task', { project: projectId }, 10);
            }));
        }).then(() => {
            session = schema.from(ormState);

            state = {
                orm: ormState,
                selectedProjectId: session.Project.first().getId(),
            };

            done();
        });
    });

    it('projects works', () => {
        const result = projects(state);

        expect(result).to.have.length(2);
        expect(result[0]).to.contain.all.keys(['id', 'name']);
    });

    it('tasks works', () => {
        const result = tasks(state);

        expect(result).to.have.length(10);
        expect(result[0]).to.contain.all.keys(['id', 'text', 'project', 'tags', 'done']);
        expect(result[0].tags).to.have.length(4);
    });

    it('project works', () => {
        const result = project(state);
        expect(result).to.be.an('object');
        expect(result).to.contain.all.keys(['id', 'name']);
    });
});

/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import {
    CREATE_TASK,
    MARK_DONE,
    DELETE_TASK,
    ADD_TAG_TO_TASK,
    REMOVE_TAG_FROM_TASK,
} from '../actionTypes';
import { schema } from '../models';
import factory from './factories';
import Promise from 'bluebird';
import { applyActionAndGetNextSession, ReduxORMAdapter } from './utils';

describe('Models', () => {
    // This will be the initial state.
    let state;

    // This will be a Session instance with the initial data.
    let session;

    beforeEach(done => {
        // Get the default state and start a mutating session.
        state = schema.getDefaultState();
        session = schema.withMutations(state);

        factory.setAdapter(new ReduxORMAdapter(session));

        factory.createMany('Project', 2).then(projects => {
            return Promise.all(projects.map(project => {
                const projectId = project.getId();

                // Create 10 tasks for both of our 2 projects.
                return factory.createMany('Task', { project: projectId }, 10);
            }));
        }).then(() => {
            // Generating data is finished, start up a session.
            session = schema.from(state);

            // Let mocha know we're done setting up.
            done();
        });
    });

    it('correctly handle CREATE_TASK', () => {
        const taskText = 'New Task Text!';
        const taskTags = 'testing, nice, cool';
        const project = session.Project.first();
        const projectId = project.getId();

        const action = {
            type: CREATE_TASK,
            payload: {
                text: taskText,
                tags: taskTags,
                project: projectId,
            },
        };

        expect(project.tasks.count()).to.equal(10);
        expect(session.Task.count()).to.equal(20);
        expect(session.Tag.count()).to.equal(80);

        // The below helper function completes an action dispatch
        // loop with the given state and action.
        // Finally, it returns a new Session started with the
        // next state yielded from the dispatch loop.
        // With this new Session, we can query the resulting state.
        const {
            Task,
            Tag,
            Project,
        } = applyActionAndGetNextSession(schema, state, action);

        expect(Project.withId(projectId).tasks.count()).to.equal(11);
        expect(Task.count()).to.equal(21);
        expect(Tag.count()).to.equal(83);

        const newTask = Task.last();

        expect(newTask.text).to.equal(taskText);
        expect(newTask.project.getId()).to.equal(projectId);
        expect(newTask.done).to.be.false;
        expect(newTask.tags.map(tag => tag.name)).to.deep.equal(['testing', 'nice', 'cool']);
    });

    it('correctly handle MARK_DONE', () => {
        const task = session.Task.filter({ done: false }).first();
        const taskId = task.getId();

        const action = {
            type: MARK_DONE,
            payload: taskId,
        };

        expect(task.done).to.be.false;

        const { Task } = applyActionAndGetNextSession(schema, state, action);

        expect(Task.withId(taskId).done).to.be.true;
    });

    it('correctly handle DELETE_TASK', () => {
        const task = session.Task.first();
        const taskId = task.getId();

        const action = {
            type: DELETE_TASK,
            payload: taskId,
        };

        expect(session.Task.count()).to.equal(20);

        const { Task } = applyActionAndGetNextSession(schema, state, action);

        expect(Task.count()).to.equal(19);
        expect(() => Task.withId(taskId)).to.throw(Error);
    });

    it('correctly handle ADD_TAG_TO_TASK', () => {
        const task = session.Task.first();
        const taskId = task.getId();

        const newTagName = 'coolnewtag';

        const action = {
            type: ADD_TAG_TO_TASK,
            payload: {
                task: taskId,
                tag: newTagName,
            },
        };

        expect(session.Tag.count()).to.equal(80);

        const { Task, Tag } = applyActionAndGetNextSession(schema, state, action);

        expect(Tag.count()).to.equal(81);
        expect(Tag.last().name).to.equal(newTagName);

        expect(Task.withId(taskId).tags.withRefs.map(tag => tag.name)).to.include(newTagName);
    });

    it('correctly handles REMOVE_TAG_FROM_TASK', () => {
        const task = session.Task.first();
        const taskId = task.getId();

        const removeTagId = task.tags.first().getId();

        const action = {
            type: REMOVE_TAG_FROM_TASK,
            payload: {
                task: taskId,
                tag: removeTagId,
            },
        };

        expect(session.Tag.count()).to.equal(80);

        const { Task, Tag } = applyActionAndGetNextSession(schema, state, action);

        // Tag count should remain the same.
        expect(Tag.count()).to.equal(80);

        expect(Task.withId(taskId).tags.withRefs.map(tag => tag.name)).to.not.include(removeTagId);
    });
});
